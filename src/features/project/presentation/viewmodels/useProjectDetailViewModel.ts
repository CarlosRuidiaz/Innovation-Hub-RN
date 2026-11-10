import { useCallback, useEffect, useMemo, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Application } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { useProfile } from "@/src/features/profile/presentation/context/ProfileContext";
import { Project } from "@/src/features/project/domain/entities/Project";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";

// Lo que el detalle de un proyecto necesita saber de quien mira y de su
// equipo: el `FutureBuilder` de `project_detail_page.dart` con las
// postulaciones aceptadas, y el `_cargar` que relee los proyectos al abrir.
export function useProjectDetailViewModel(argument: Project) {
  const applications = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);
  const { projects, refresh } = useProjects();
  const { profile } = useProfile();

  // El proyecto del argumento es la foto que tenia la cartelera al abrirlo. La
  // copia viva es la del contexto: se prefiere esa, y el argumento queda de
  // respaldo.
  const project = projects.find((p) => p.id === argument.id) ?? argument;
  const projectId = project.id ?? "";

  const [accepted, setAccepted] = useState<Application[]>([]);

  // Al abrir el detalle se releen los proyectos: pudo cambiar su numero de
  // miembros o su etapa.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // El equipo: el lider mas las postulaciones aceptadas.
  useEffect(() => {
    let active = true;
    applications.getApplicationsFor(projectId).then(
      (list) => {
        if (active) setAccepted(list.filter((a) => a.status === "accepted"));
      },
      () => {
        // Sin red se muestra solo al lider, como el `snapshot.data ?? []` de Flutter.
      },
    );
    return () => {
      active = false;
    };
  }, [applications, projectId, project.currentMembers]);

  const myId = profile?.id ?? null;
  const isLeader = myId != null && project.leaderId === myId;
  const isMember = myId != null && accepted.some((a) => a.applicantId === myId);

  const team = useMemo(() => {
    const leaderName = isLeader ? (profile?.fullName ?? "Líder del proyecto") : "Líder del proyecto";
    return {
      initials: [initials(leaderName), ...accepted.map((a) => initials(a.applicantName))],
      names: [isLeader ? shortName(leaderName) : leaderName, ...accepted.map((a) => shortName(a.applicantName))].join(" · "),
    };
  }, [accepted, isLeader, profile]);

  const reload = useCallback(() => refresh(), [refresh]);

  return { project, myId, isLeader, isMember, team, reload };
}

// Las dos primeras iniciales de un nombre completo.
function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return letters || "?";
}

// "Carlos R.": un nombre sin apellido (el marcador del lider) se deja tal cual.
function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length !== 2) return name;
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}
