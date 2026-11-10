import { useCallback, useMemo, useRef, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { isActive, Poll } from "../../domain/entities/Poll";
import { PollResponse } from "../../domain/entities/PollResponse";
import { PollRepository } from "../../domain/repositories/PollRepository";

type PollState = {
  isLoading: boolean;
  // projectId -> sus encuestas.
  projectPolls: Record<string, Poll[]>;
  // pollId -> sus respuestas.
  pollResponses: Record<string, PollResponse[]>;
};

const EMPTY: PollState = { isLoading: false, projectPolls: {}, pollResponses: {} };

// Las encuestas de un proyecto y sus respuestas: el `PollController` de Flutter.
//
// Quien tiene la sesion sale de `useSession()`, que es lo que en Flutter era
// `authRepo.getLoggedUser()`; el perfil, del repositorio, como alla.
//
// En Flutter era uno solo para toda la app. Aqui cada pantalla y cada bloque
// monta el suyo y pide lo que necesita al abrirse, igual que hacian alla (los
// bloques recargaban en cada `build` y los resultados al abrirse).
export function usePollViewModel() {
  const pollRepo = useInject<PollRepository>(TOKENS.PollRepo);
  const profileRepo = useInject<ProfileRepository>(TOKENS.ProfileRepo);
  const projectRepo = useInject<ProjectRepository>(TOKENS.ProjectRepo);
  const appRepo = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);
  const { currentUser } = useSession();

  const [state, setState] = useState<PollState>(EMPTY);
  const stateRef = useRef<PollState>(EMPTY);
  const commit = useCallback((update: (s: PollState) => Partial<PollState>) => {
    stateRef.current = { ...stateRef.current, ...update(stateRef.current) };
    setState(stateRef.current);
  }, []);

  const loadResponsesForPoll = useCallback(
    async (pollId: string) => {
      try {
        const responses = await pollRepo.getResponsesForPoll(pollId);
        commit((s) => ({ pollResponses: { ...s.pollResponses, [pollId]: responses } }));
      } catch {
        // Como en Flutter: sin respuestas nuevas, se queda lo que habia.
      }
    },
    [commit, pollRepo],
  );

  const loadPollsForProject = useCallback(
    async (projectId: string) => {
      commit(() => ({ isLoading: true }));
      try {
        const polls = await pollRepo.getPollsForProject(projectId);
        commit((s) => ({ projectPolls: { ...s.projectPolls, [projectId]: polls } }));
        for (const poll of polls) {
          if (poll.id != null) await loadResponsesForPoll(poll.id);
        }
      } catch {
        // Si falla, el bloque se queda como estaba.
      } finally {
        commit(() => ({ isLoading: false }));
      }
    },
    [commit, loadResponsesForPoll, pollRepo],
  );

  const createPoll = useCallback(
    async (poll: Poll): Promise<Poll | null> => {
      commit(() => ({ isLoading: true }));
      try {
        const created = await pollRepo.createPoll(poll);
        commit((s) => ({
          projectPolls: { ...s.projectPolls, [poll.projectId]: [...(s.projectPolls[poll.projectId] ?? []), created] },
        }));
        return created;
      } catch {
        return null;
      } finally {
        commit(() => ({ isLoading: false }));
      }
    },
    [commit, pollRepo],
  );

  const respondPoll = useCallback(
    async (response: PollResponse): Promise<PollResponse | null> => {
      commit(() => ({ isLoading: true }));
      try {
        const created = await pollRepo.createResponse(response);
        commit((s) => ({
          pollResponses: {
            ...s.pollResponses,
            [response.pollId]: [...(s.pollResponses[response.pollId] ?? []), created],
          },
        }));
        return created;
      } catch {
        return null;
      } finally {
        commit(() => ({ isLoading: false }));
      }
    },
    [commit, pollRepo],
  );

  // Mira las respuestas ya cargadas de esa encuesta.
  const hasResponded = useCallback(
    async (pollId: string) => {
      const user = currentUser();
      if (user == null) return false;
      return (stateRef.current.pollResponses[pollId] ?? []).some((r) => r.respondentId === user.userId);
    },
    [currentUser],
  );

  // Ve los resultados: cualquiera si ya cerro; si sigue abierta, quien ya
  // respondio y el equipo (el lider y los aceptados).
  const canViewResults = useCallback(
    async (poll: Poll) => {
      if (!isActive(poll)) return true;

      const user = currentUser();
      if (user == null) return false;

      if (await hasResponded(poll.id ?? "")) return true;

      const project = (await projectRepo.getProjects()).find((p) => p.id === poll.projectId);
      if (project != null && project.leaderId === user.userId) return true;

      const apps = await appRepo.getApplicationsFor(poll.projectId);
      return apps.some((a) => a.applicantId === user.userId && a.status === "accepted");
    },
    [appRepo, currentUser, hasResponded, projectRepo],
  );

  // Responde: si sigue abierta, no ha respondido y, si la encuesta tiene
  // audiencia, es de ese programa. Cada estudiante responde una sola vez.
  //
  // Si ya respondio se mira en el repositorio, no en lo cargado: lo cargado
  // puede estar vacio porque fallo la carga o porque respondio en otra
  // pantalla. Si no se pueden leer las respuestas, no deja responder.
  const canRespond = useCallback(
    async (poll: Poll) => {
      if (!isActive(poll)) return false;

      const user = currentUser();
      if (user == null || poll.id == null) return false;

      try {
        const responses = await pollRepo.getResponsesForPoll(poll.id);
        if (responses.some((r) => r.respondentId === user.userId)) return false;
      } catch {
        return false;
      }

      if (poll.audienceProgram != null) {
        const profile = await profileRepo.getCurrentProfile();
        if (profile.academicProgram !== poll.audienceProgram) return false;
      }

      return true;
    },
    [currentUser, pollRepo, profileRepo],
  );

  return useMemo(
    () => ({
      ...state,
      loadPollsForProject,
      loadResponsesForPoll,
      createPoll,
      respondPoll,
      hasResponded,
      canViewResults,
      canRespond,
    }),
    [state, loadPollsForProject, loadResponsesForPoll, createPoll, respondPoll, hasResponded, canViewResults, canRespond],
  );
}

export type PollViewModel = ReturnType<typeof usePollViewModel>;
