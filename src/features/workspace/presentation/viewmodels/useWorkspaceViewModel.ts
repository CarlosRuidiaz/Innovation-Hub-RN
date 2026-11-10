import { useCallback, useMemo, useRef, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Application } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { Project } from "@/src/features/project/domain/entities/Project";
import { ProjectStage } from "@/src/features/project/domain/entities/ProjectStage";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { Milestone, newMilestone } from "../../domain/entities/Milestone";
import { newProgressUpdate, ProgressUpdate } from "../../domain/entities/ProgressUpdate";
import { newProjectTask, ProjectTask } from "../../domain/entities/ProjectTask";
import { WorkspaceRepository } from "../../domain/repositories/WorkspaceRepository";
import { TeamMember } from "./TeamMember";

// Lo que la pantalla lee del espacio de trabajo.
type WorkspaceState = {
  project: Project | null;
  profile: Profile | null;
  members: TeamMember[];
  milestones: Milestone[];
  // El mas reciente primero: asi lo entrega ya el repositorio.
  updates: ProgressUpdate[];
  tasks: ProjectTask[];
  isLoading: boolean;
  // Verdadero cuando ya hay algo que enseñar. El indicador de carga a pantalla
  // completa solo tiene sentido mientras es falso: refrescar una lista que ya
  // esta a la vista no debe reemplazarla por el indicador.
  hasData: boolean;
  // Verdadero si la ultima carga fallo y no hay nada que enseñar.
  failed: boolean;
};

const EMPTY: WorkspaceState = {
  project: null,
  profile: null,
  members: [],
  milestones: [],
  updates: [],
  tasks: [],
  isLoading: false,
  hasData: false,
  failed: false,
};

// ── Reglas: las mismas de `WorkspaceController`, en funciones puras ─────────

// Se calcula, nunca se guarda: sin hitos el avance es 0. Lo que si se guarda es
// una foto de este numero dentro de cada avance publicado.
export function progressPercentOf(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.done).length;
  return Math.round((done / milestones.length) * 100);
}

const isLeaderOf = (s: WorkspaceState) => s.profile != null && s.project != null && s.profile.id === s.project.leaderId;

// El lider y los miembros aceptados. Nadie mas.
function canEnterOf(s: WorkspaceState): boolean {
  const me = s.profile?.id;
  if (me == null) return false;
  return isLeaderOf(s) || s.members.some((m) => !m.isLeader && m.id === me);
}

function buildMembers(project: Project, applications: Application[], me: Profile | null): TeamMember[] {
  const leaderIsViewing = me != null && me.id === project.leaderId;

  const leader: TeamMember = {
    id: project.leaderId,
    name: leaderIsViewing ? me.fullName : "Líder del proyecto",
    academicProgram: leaderIsViewing ? me.academicProgram : "",
    isLeader: true,
    applicationId: null,
  };

  const accepted = applications
    .filter((a) => a.status === "accepted")
    .map<TeamMember>((a) => ({
      id: a.applicantId,
      name: a.applicantName,
      academicProgram: a.applicantProgram,
      isLeader: false,
      applicationId: a.id,
    }));

  return [leader, ...accepted];
}

// El espacio de trabajo del proyecto: el lugar privado del equipo, distinto del
// detalle publico. Es el `WorkspaceController` de Flutter.
//
// El proyecto le llega por `open`, tal como lo recibe la pantalla por la ruta,
// y despues lo vuelve a pedir a `ProjectRepository` para no trabajar con la
// foto vieja del contador de miembros o de la etapa. Vive sobre
// `WorkspaceRepository` para hitos, avances y tareas, y sobre
// `ApplicationRepository` y `ProfileRepository` para saber quien es el equipo y
// quien tiene la sesion.
//
// Las acciones leen el estado de una referencia y no del render: publicar un
// avance marca un hito y enseguida calcula el porcentaje, y ese calculo tiene
// que ver el hito ya marcado.
export function useWorkspaceViewModel() {
  const repository = useInject<WorkspaceRepository>(TOKENS.WorkspaceRepo);
  const applicationRepository = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);
  const profileRepository = useInject<ProfileRepository>(TOKENS.ProfileRepo);
  const projectRepository = useInject<ProjectRepository>(TOKENS.ProjectRepo);

  const [state, setState] = useState<WorkspaceState>(EMPTY);
  const stateRef = useRef<WorkspaceState>(EMPTY);
  const commit = useCallback((patch: Partial<WorkspaceState>) => {
    stateRef.current = { ...stateRef.current, ...patch };
    setState(stateRef.current);
  }, []);

  // Solo vale la ultima carga: si se abre otro proyecto a mitad de camino, la
  // respuesta vieja no pisa lo nuevo.
  const ticketRef = useRef(0);

  // La copia viva del proyecto. `ProjectRepository` no tiene busqueda por id y
  // es un contrato compartido: se filtra la lista.
  const fetchProject = useCallback(
    async (projectId: string) => (await projectRepository.getProjects()).find((p) => p.id === projectId) ?? null,
    [projectRepository],
  );

  const fetchMembers = useCallback(
    async (project: Project, me: Profile | null) =>
      buildMembers(project, await applicationRepository.getApplicationsFor(project.id ?? ""), me),
    [applicationRepository],
  );

  const load = useCallback(
    async (project: Project) => {
      const ticket = ++ticketRef.current;
      commit({ isLoading: true, failed: false });
      try {
        const profile = await profileRepository.getCurrentProfile();
        if (ticket !== ticketRef.current) return;
        commit({ profile });

        const projectId = project.id ?? "";
        const current = (await fetchProject(projectId)) ?? project;
        if (ticket !== ticketRef.current) return;
        commit({ project: current });

        const members = await fetchMembers(current, profile);
        const milestones = await repository.getMilestones(projectId);
        const updates = await repository.getUpdates(projectId);
        const tasks = await repository.getTasks(projectId);
        if (ticket !== ticketRef.current) return;
        commit({ members, milestones, updates, tasks, hasData: true });
      } catch {
        if (ticket === ticketRef.current) commit({ failed: true });
      } finally {
        if (ticket === ticketRef.current) commit({ isLoading: false });
      }
    },
    [commit, fetchMembers, fetchProject, profileRepository, repository],
  );

  // Se llama cada vez que se abre el espacio de trabajo: el perfil se pide de
  // nuevo, para que otra cuenta no herede los permisos de la anterior.
  //
  // Parte de cero: lo que hubiera de otro proyecto o de otra cuenta se borra
  // antes de pedir nada, para que no se vea ni un instante.
  const open = useCallback(
    async (project: Project) => {
      commit({ ...EMPTY, project });
      await load(project);
    },
    [commit, load],
  );

  // Vuelve a pedir todo sin vaciar la pantalla: es lo que hace deslizar para
  // refrescar.
  const reload = useCallback(async () => {
    const current = stateRef.current.project;
    if (current == null) return;
    await load(current);
  }, [load]);

  // Despues de cambiar el equipo o la etapa: el proyecto y los miembros.
  const reloadTeam = useCallback(
    async (projectId: string) => {
      const fresh = await fetchProject(projectId);
      if (fresh != null) commit({ project: fresh });
      const project = stateRef.current.project;
      if (project == null) return;
      commit({ members: await fetchMembers(project, stateRef.current.profile) });
    },
    [commit, fetchMembers, fetchProject],
  );

  // Un miembro que no es el lider sale del proyecto: su postulacion pasa a
  // `left` y el contador baja en 1. Devuelve verdadero si salio.
  //
  // No recarga el equipo despues: quien sale deja la pantalla, y recargar
  // primero lo dejaria viendo un instante "sin acceso" detras de la hoja.
  const leave = useCallback(async (): Promise<boolean> => {
    const s = stateRef.current;
    const projectId = s.project?.id;
    const me = s.profile?.id;
    if (projectId == null || me == null || isLeaderOf(s)) return false;

    const mine = s.members.find((m) => !m.isLeader && m.id === me);
    const applicationId = mine?.applicationId;
    if (applicationId == null) return false;

    await applicationRepository.leave(applicationId);
    await projectRepository.removeMember(projectId);
    return true;
  }, [applicationRepository, projectRepository]);

  // El lider saca a un miembro: su postulacion pasa a `removed` y el contador
  // baja en 1. Quien queda removido no puede volver a postularse.
  const removeMember = useCallback(
    async (member: TeamMember) => {
      const s = stateRef.current;
      const projectId = s.project?.id;
      const applicationId = member.applicationId;
      if (projectId == null || !isLeaderOf(s)) return;
      if (member.isLeader || applicationId == null) return;

      await applicationRepository.decide(applicationId, "removed");
      await projectRepository.removeMember(projectId);
      await reloadTeam(projectId);
    },
    [applicationRepository, projectRepository, reloadTeam],
  );

  // El lider cambia la etapa del proyecto entre las seis de `ProjectStage`.
  const updateStage = useCallback(
    async (stage: ProjectStage) => {
      const s = stateRef.current;
      const projectId = s.project?.id;
      if (projectId == null || !isLeaderOf(s)) return;

      await projectRepository.updateStage(projectId, stage);
      await reloadTeam(projectId);
    },
    [projectRepository, reloadTeam],
  );

  const addMilestone = useCallback(
    async (title: string, dueDate: Date) => {
      const s = stateRef.current;
      const projectId = s.project?.id;
      if (projectId == null || !isLeaderOf(s)) return;

      await repository.addMilestone(newMilestone({ projectId, title, dueDate }));
      commit({ milestones: await repository.getMilestones(projectId) });
    },
    [commit, repository],
  );

  const setMilestoneDone = useCallback(
    async (milestoneId: string, done: boolean) => {
      if (!isLeaderOf(stateRef.current)) return;

      await repository.setMilestoneDone(milestoneId, done);
      const projectId = stateRef.current.project?.id;
      if (projectId != null) commit({ milestones: await repository.getMilestones(projectId) });
    },
    [commit, repository],
  );

  const publishUpdate = useCallback(
    async ({
      title,
      description,
      videoUrl = null,
      milestoneId = null,
    }: {
      title: string;
      description: string;
      videoUrl?: string | null;
      milestoneId?: string | null;
    }) => {
      const s = stateRef.current;
      const projectId = s.project?.id;
      if (projectId == null || !canEnterOf(s)) return;

      // Primero se marca el hito y despues se calcula el porcentaje, para que la
      // foto que se guarda en el avance ya lo incluya. Se llama al repositorio
      // directo y no a `setMilestoneDone`: cualquier miembro puede cumplir un
      // hito al publicar, aunque solo el lider pueda marcarlo a mano.
      if (milestoneId != null) {
        await repository.setMilestoneDone(milestoneId, true);
        commit({ milestones: await repository.getMilestones(projectId) });
      }

      const profile = stateRef.current.profile;
      await repository.publishUpdate(
        newProgressUpdate({
          projectId,
          authorId: profile?.id ?? "",
          authorName: profile?.fullName ?? "",
          title,
          description,
          createdAt: new Date(),
          completionPercentage: progressPercentOf(stateRef.current.milestones),
          videoUrl,
          milestoneId,
        }),
      );
      commit({ updates: await repository.getUpdates(projectId) });
    },
    [commit, repository],
  );

  const addTask = useCallback(
    async (title: string, assigneeName: string) => {
      const s = stateRef.current;
      const projectId = s.project?.id;
      if (projectId == null || !canEnterOf(s)) return;

      await repository.addTask(newProjectTask({ projectId, title, assigneeName }));
      commit({ tasks: await repository.getTasks(projectId) });
    },
    [commit, repository],
  );

  const setTaskDone = useCallback(
    async (taskId: string, done: boolean) => {
      if (!canEnterOf(stateRef.current)) return;

      await repository.setTaskDone(taskId, done);
      const projectId = stateRef.current.project?.id;
      if (projectId != null) commit({ tasks: await repository.getTasks(projectId) });
    },
    [commit, repository],
  );

  return useMemo(() => {
    const isLeader = isLeaderOf(state);
    const canEnter = canEnterOf(state);
    return {
      ...state,
      totalMilestones: state.milestones.length,
      completedMilestones: state.milestones.filter((m) => m.done).length,
      progressPercent: progressPercentOf(state.milestones),
      isLeader,
      canEnter,
      // Quien puede salir: un miembro aceptado que no es el lider. Un lider no
      // se va de su propio proyecto.
      canLeave: canEnter && !isLeader,
      // Hitos sin cumplir: son los que se pueden elegir al publicar un avance.
      pendingMilestones: state.milestones.filter((m) => !m.done),
      // El repositorio, como `controller.repository` en Flutter: las pruebas
      // lo usan para simular lo que publica otro miembro.
      repository,
      open,
      reload,
      leave,
      removeMember,
      updateStage,
      addMilestone,
      setMilestoneDone,
      publishUpdate,
      addTask,
      setTaskDone,
    };
  }, [
    state,
    repository,
    open,
    reload,
    leave,
    removeMember,
    updateStage,
    addMilestone,
    setMilestoneDone,
    publishUpdate,
    addTask,
    setTaskDone,
  ]);
}

export type WorkspaceViewModel = ReturnType<typeof useWorkspaceViewModel>;
