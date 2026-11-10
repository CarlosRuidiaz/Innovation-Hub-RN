import { useCallback, useEffect, useMemo, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { useProfile } from "@/src/features/profile/presentation/context/ProfileContext";
import { Project } from "@/src/features/project/domain/entities/Project";
import { summarizeFeedback } from "../../domain/entities/FeedbackSummary";
import { isReply, newProjectComment, ProjectComment } from "../../domain/entities/ProjectComment";
import { newProjectFeedback, ProjectFeedback } from "../../domain/entities/ProjectFeedback";
import { ShowcaseRepository } from "../../domain/repositories/ShowcaseRepository";

export type FeedbackScores = {
  usability: number;
  innovation: number;
  visualDesign: number;
  feasibility: number;
  comment?: string | null;
};

// Lo que se cargo del prototipo, y para quien: el detalle es de quien tenga la
// sesion. Si entra otra cuenta, o se cierra la sesion, lo de la anterior no se
// muestra (el `_vaciarDelUsuario` de Flutter).
type Loaded = {
  key: string;
  isTeamMember: boolean;
  comments: ProjectComment[];
  feedback: ProjectFeedback[];
};

const keyOf = (projectId: string, userId: string) => `${projectId}|${userId}`;

// El nombre con el que se firma un comentario o una retroalimentacion.
const authorNameOf = (fullName: string | undefined) => (fullName && fullName.length > 0 ? fullName : "Estudiante");

// El detalle de un prototipo de `ShowcaseController`: si quien mira es del
// equipo, los comentarios con sus respuestas y la retroalimentacion.
export function usePrototypeDetailViewModel(project: Project) {
  const showcaseRepository = useInject<ShowcaseRepository>(TOKENS.ShowcaseRepo);
  const applicationRepository = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);
  const { profile, isLoading: profileLoading } = useProfile();

  const projectId = project.id ?? "";
  const userId = profile?.id ?? "";
  const key = profile != null && projectId.length > 0 ? keyOf(projectId, userId) : null;

  const [loaded, setLoaded] = useState<Loaded | null>(null);

  // Son del equipo el lider y los miembros con la postulacion aceptada.
  const checkTeamMembership = useCallback(async () => {
    if (userId.length === 0) return false;
    if (userId === project.leaderId) return true;
    const applications = await applicationRepository.getApplicationsFor(projectId);
    return applications.some((a) => a.applicantId === userId && a.status === "accepted");
  }, [applicationRepository, project.leaderId, projectId, userId]);

  const readThread = useCallback(async () => {
    const comments = await showcaseRepository.getComments(projectId);
    const feedback = await showcaseRepository.getFeedback(projectId);
    return { comments, feedback };
  }, [showcaseRepository, projectId]);

  // Al abrir el prototipo (`openProject`): primero si es del equipo y luego los
  // comentarios y la retroalimentacion.
  useEffect(() => {
    if (key == null) return;
    let active = true;
    checkTeamMembership()
      .then(
        async (isTeamMember) => {
          try {
            return { isTeamMember, ...(await readThread()) };
          } catch {
            // `refreshDetail` de Flutter: si falla, el detalle se queda vacio.
            return { isTeamMember, comments: [], feedback: [] };
          }
        },
        // Sin saber si es del equipo, Flutter no lee el resto.
        () => ({ isTeamMember: false, comments: [], feedback: [] }),
      )
      .then((detail) => {
        if (active) setLoaded({ key, ...detail });
      });
    return () => {
      active = false;
    };
  }, [key, checkTeamMembership, readThread]);

  const current = key != null && loaded?.key === key ? loaded : null;
  // El `isLoadingDetail` de Flutter: mientras llega el perfil o el hilo.
  const isLoading = profileLoading || (key != null && current == null);
  const isTeamMember = current?.isTeamMember ?? false;
  const comments = useMemo(() => current?.comments ?? [], [current]);
  const feedbackList = useMemo(() => current?.feedback ?? [], [current]);

  // `refreshDetail`: relee comentarios y retroalimentacion. Es lo que corre al
  // deslizar y despues de comentar o calificar.
  const refresh = useCallback(async () => {
    if (key == null) return;
    try {
      const thread = await readThread();
      setLoaded((prev) => (prev?.key === key ? { ...prev, ...thread } : prev));
    } catch {
      // Como en Flutter: se queda lo que habia.
    }
  }, [key, readThread]);

  const feedbackSummary = useMemo(() => summarizeFeedback(feedbackList), [feedbackList]);

  const myFeedback = useMemo(
    () => (userId.length > 0 && current != null ? (feedbackList.find((f) => f.authorId === userId) ?? null) : null),
    [feedbackList, userId, current],
  );

  // Los comentarios raiz, del mas nuevo al mas viejo.
  const rootComments = useMemo(
    () => comments.filter((c) => !isReply(c)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [comments],
  );

  // Las respuestas a un comentario raiz, en orden cronologico.
  const repliesFor = useCallback(
    (parentId: string) =>
      comments.filter((c) => c.parentId === parentId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    [comments],
  );

  const addComment = useCallback(
    async (text: string, parentId: string | null = null): Promise<boolean> => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || projectId.length === 0 || current == null) return false;
      const replying = parentId != null && parentId.length > 0;
      // Solo el equipo responde.
      if (replying && !isTeamMember) return false;
      // Un solo nivel de respuestas: no se responde a una respuesta.
      if (replying) {
        const parent = comments.find((c) => c.id === parentId);
        if (parent != null && isReply(parent)) return false;
      }
      try {
        await showcaseRepository.addComment(
          newProjectComment({
            projectId,
            authorId: userId,
            authorName: authorNameOf(profile?.fullName),
            text: trimmed,
            parentId: replying ? parentId : null,
            isTeam: isTeamMember,
            createdAt: new Date(),
          }),
        );
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [projectId, current, isTeamMember, comments, showcaseRepository, userId, profile, refresh],
  );

  const submitFeedback = useCallback(
    async ({ usability, innovation, visualDesign, feasibility, comment }: FeedbackScores): Promise<boolean> => {
      // El equipo no califica su propio proyecto.
      if (isTeamMember || projectId.length === 0 || current == null) return false;
      const trimmed = comment?.trim() ?? "";
      try {
        await showcaseRepository.saveFeedback(
          newProjectFeedback({
            // Si ya dejo una, se reemplaza esa.
            id: myFeedback?.id ?? null,
            projectId,
            authorId: userId,
            authorName: authorNameOf(profile?.fullName),
            usability,
            innovation,
            visualDesign,
            feasibility,
            comment: trimmed.length > 0 ? trimmed : null,
            createdAt: new Date(),
          }),
        );
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [isTeamMember, projectId, current, myFeedback, showcaseRepository, userId, profile, refresh],
  );

  return {
    project,
    isLoading,
    isTeamMember,
    comments,
    feedbackList,
    feedbackSummary,
    myFeedback,
    rootComments,
    repliesFor,
    refresh,
    addComment,
    submitFeedback,
  };
}
