import { useCallback, useRef, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Project } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { summarizeFeedback } from "../../domain/entities/FeedbackSummary";
import { ShowcaseRepository } from "../../domain/repositories/ShowcaseRepository";

// Lo que la tarjeta de un prototipo muestra de sus comentarios y su
// retroalimentacion: los `commentCounts`, `feedbackAverages` y `feedbackCounts`
// de Flutter, juntos por proyecto.
export type PrototypeStats = {
  commentCount: number;
  overallAverage: number;
  feedbackCount: number;
};

export const SHOWCASE_ERROR = "No se pudieron cargar los prototipos.";

// La vitrina de `ShowcaseController`: los proyectos en etapa Prototype y sus
// cifras. La pantalla llama a `load` al entrar, al volver del detalle (ahi
// pudieron cambiar las cifras), al deslizar y con "Reintentar" o "Actualizar".
export function useShowcaseViewModel() {
  const projectRepository = useInject<ProjectRepository>(TOKENS.ProjectRepo);
  const showcaseRepository = useInject<ShowcaseRepository>(TOKENS.ShowcaseRepo);

  const [prototypes, setPrototypes] = useState<Project[]>([]);
  const [stats, setStats] = useState<Record<string, PrototypeStats>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Solo vale la ultima carga: una respuesta vieja no pisa una nueva.
  const requestRef = useRef(0);

  const loadStatsFor = useCallback(
    async (projectId: string, request: number) => {
      try {
        const comments = await showcaseRepository.getComments(projectId);
        const feedback = await showcaseRepository.getFeedback(projectId);
        const summary = summarizeFeedback(feedback);
        if (request !== requestRef.current) return;
        setStats((prev) => ({
          ...prev,
          [projectId]: {
            commentCount: comments.length,
            overallAverage: summary.overallAverage,
            feedbackCount: summary.totalCount,
          },
        }));
      } catch {
        // Como en Flutter: sin cifras, la tarjeta muestra 0 y "Sin calificaciones".
      }
    },
    [showcaseRepository],
  );

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    // El cargando solo se ve con la lista vacia; si ya hay prototipos, se
    // quedan a la vista mientras se releen.
    setIsLoading(true);
    setError("");
    try {
      const all = await projectRepository.getProjects();
      if (request !== requestRef.current) return;
      const found = all.filter((p) => p.stage === "prototype");
      setPrototypes(found);
      for (const p of found) {
        if (p.id) loadStatsFor(p.id, request);
      }
    } catch {
      if (request === requestRef.current) setError(SHOWCASE_ERROR);
    } finally {
      if (request === requestRef.current) setIsLoading(false);
    }
  }, [projectRepository, loadStatsFor]);

  const statsFor = useCallback(
    (projectId: string | null): PrototypeStats =>
      (projectId ? stats[projectId] : undefined) ?? { commentCount: 0, overallAverage: 0, feedbackCount: 0 },
    [stats],
  );

  return {
    prototypes,
    statsFor,
    isLoading: isLoading && prototypes.length === 0,
    error,
    load,
  };
}
