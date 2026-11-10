import { act, renderHook } from "@testing-library/react-native";
import React from "react";

import { Container } from "@/src/core/di/container";
import { DIProvider } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, ApplicationStatus, newApplication } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { newProject, Project } from "@/src/features/project/domain/entities/Project";
import { ProjectStage } from "@/src/features/project/domain/entities/ProjectStage";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { Milestone } from "@/src/features/workspace/domain/entities/Milestone";
import { ProgressUpdate } from "@/src/features/workspace/domain/entities/ProgressUpdate";
import { ProjectTask } from "@/src/features/workspace/domain/entities/ProjectTask";
import { WorkspaceRepository } from "@/src/features/workspace/domain/repositories/WorkspaceRepository";
import { useWorkspaceViewModel } from "@/src/features/workspace/presentation/viewmodels/useWorkspaceViewModel";
import { fake } from "@/__tests__/support/fake";

// `workspace_controller_test.dart`, una por una.

class FakeWorkspaceRepository implements WorkspaceRepository {
  milestones: Milestone[] = [];
  updates: ProgressUpdate[] = [];
  tasks: ProjectTask[] = [];
  private nextId = 1;

  async getMilestones(projectId: string) {
    return this.milestones.filter((m) => m.projectId === projectId);
  }

  async addMilestone(milestone: Milestone) {
    const created = { ...milestone, id: `${this.nextId++}` };
    this.milestones.push(created);
    return created;
  }

  async setMilestoneDone(milestoneId: string, done: boolean) {
    this.milestones = this.milestones.map((m) => (m.id === milestoneId ? { ...m, done } : m));
  }

  async getUpdates(projectId: string) {
    return this.updates.filter((u) => u.projectId === projectId);
  }

  async publishUpdate(update: ProgressUpdate) {
    this.updates.push(update);
    if (update.milestoneId != null) await this.setMilestoneDone(update.milestoneId, true);
    return update;
  }

  async getTasks(projectId: string) {
    return this.tasks.filter((t) => t.projectId === projectId);
  }

  async addTask(task: ProjectTask) {
    this.tasks.push(task);
    return task;
  }

  async setTaskDone(taskId: string, done: boolean) {
    this.tasks = this.tasks.map((t) => (t.id === taskId ? { ...t, done } : t));
  }
}

class FakeApplicationRepository {
  applications: Application[] = [];

  private change(applicationId: string, status: ApplicationStatus) {
    this.applications = this.applications.map((a) => (a.id === applicationId ? { ...a, status } : a));
  }

  readonly repo = fake<ApplicationRepository>(
    {
      getApplicationsFor: async (projectId) => this.applications.filter((a) => a.projectId === projectId),
      leave: async (applicationId) => this.change(applicationId, "left"),
      decide: async (applicationId, decision) => this.change(applicationId, decision),
    },
    "ApplicationRepository",
  );
}

class FakeProfileRepository implements ProfileRepository {
  current: Profile = liderProfile;
  async getCurrentProfile() {
    return this.current;
  }
}

class FakeProjectRepository {
  constructor(public project: Project) {}

  readonly repo = fake<ProjectRepository>(
    {
      getProjects: async () => [this.project],
      removeMember: async () => {
        if (this.project.currentMembers > 1) {
          this.project = { ...this.project, currentMembers: this.project.currentMembers - 1 };
        }
      },
      updateStage: async (_projectId: string, stage: ProjectStage) => {
        this.project = { ...this.project, stage };
      },
    },
    "ProjectRepository",
  );
}

const liderId = "leader";
const miembroId = "member1";

const liderProfile: Profile = {
  id: liderId,
  fullName: "Ana Líder",
  academicProgram: "Ingeniería de Sistemas",
  semester: 8,
  skills: [],
  bio: null,
};

const miembroProfile: Profile = {
  id: miembroId,
  fullName: "Miembro Aceptado",
  academicProgram: "Diseño Industrial",
  semester: 5,
  skills: [],
  bio: null,
};

const visitanteProfile: Profile = {
  id: "visitante",
  fullName: "Alguien Mas",
  academicProgram: "Psicología",
  semester: 3,
  skills: [],
  bio: null,
};

const proyecto = (): Project =>
  newProject({
    id: "p1",
    title: "Proyecto de prueba",
    problem: "Un problema",
    description: "Una descripcion",
    stage: "idea",
    academicProgram: "Ingeniería de Sistemas",
    currentMembers: 2,
    maxMembers: 4,
    skillsWanted: [],
    leaderId: liderId,
  });

describe("WorkspaceViewModel", () => {
  let workspaceRepository: FakeWorkspaceRepository;
  let applicationRepository: FakeApplicationRepository;
  let profileRepository: FakeProfileRepository;
  let projectRepository: FakeProjectRepository;
  let project: Project;

  beforeEach(() => {
    project = proyecto();
    workspaceRepository = new FakeWorkspaceRepository();
    applicationRepository = new FakeApplicationRepository();
    applicationRepository.applications = [
      newApplication({
        id: "a1",
        projectId: "p1",
        applicantId: miembroId,
        applicantName: miembroProfile.fullName,
        applicantProgram: miembroProfile.academicProgram,
        applicantSemester: miembroProfile.semester,
        skillsOffered: [],
        status: "accepted",
      }),
    ];
    profileRepository = new FakeProfileRepository();
    projectRepository = new FakeProjectRepository(project);
  });

  // En Flutter, `WorkspaceController(...)`. Aqui el view model se monta con
  // sus cuatro repositorios falsos.
  function renderViewModel() {
    const container = new Container()
      .register(TOKENS.WorkspaceRepo, workspaceRepository)
      .register(TOKENS.ApplicationRepo, applicationRepository.repo)
      .register(TOKENS.ProfileRepo, profileRepository)
      .register(TOKENS.ProjectRepo, projectRepository.repo);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>{children}</DIProvider>
    );
    return renderHook(() => useWorkspaceViewModel(), { wrapper }).result;
  }

  // Cada paso del view model, dentro de `act`: cambia su estado.
  const run = (step: () => Promise<unknown>) =>
    act(async () => {
      await step();
    });

  const estadoDe = (applicationId: string) =>
    applicationRepository.applications.find((a) => a.id === applicationId)!.status;

  describe("porcentaje", () => {
    it("sin hitos el porcentaje es 0", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));

      expect(vm.current.totalMilestones).toBe(0);
      expect(vm.current.progressPercent).toBe(0);
    });

    it("con algunos hitos cumplidos es proporcional", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));
      await run(() => vm.current.addMilestone("Hito 2", new Date(2026, 1, 1)));
      await run(() => vm.current.addMilestone("Hito 3", new Date(2026, 2, 1)));

      await run(() => vm.current.setMilestoneDone(vm.current.milestones[0].id!, true));

      expect(vm.current.progressPercent).toBe(33);
    });

    it("con todos los hitos cumplidos es 100", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));
      await run(() => vm.current.addMilestone("Hito 2", new Date(2026, 1, 1)));

      for (const hito of vm.current.milestones) {
        await run(() => vm.current.setMilestoneDone(hito.id!, true));
      }

      expect(vm.current.progressPercent).toBe(100);
    });
  });

  describe("hitos", () => {
    it("solo el lider puede marcar un hito como cumplido", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));
      const hitoId = vm.current.milestones[0].id!;

      // El miembro aceptado no es el lider: no puede marcarlo.
      profileRepository.current = miembroProfile;
      await run(() => vm.current.open(project));
      await run(() => vm.current.setMilestoneDone(hitoId, true));
      expect(vm.current.milestones[0].done).toBe(false);

      // El lider si puede.
      profileRepository.current = liderProfile;
      await run(() => vm.current.open(project));
      await run(() => vm.current.setMilestoneDone(hitoId, true));
      expect(vm.current.milestones[0].done).toBe(true);
    });

    it("addMilestone no hace nada si quien llama no es el lider", async () => {
      profileRepository.current = miembroProfile;
      const vm = renderViewModel();
      await run(() => vm.current.open(project));

      await run(() => vm.current.addMilestone("Hito intruso", new Date(2026, 0, 1)));

      expect(vm.current.milestones).toEqual([]);
    });
  });

  describe("avances", () => {
    it("publicar un avance que cumple un hito lo marca y sube el porcentaje", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));
      await run(() => vm.current.addMilestone("Hito 2", new Date(2026, 1, 1)));
      const hitoId = vm.current.milestones[0].id!;
      expect(vm.current.progressPercent).toBe(0);

      await run(() =>
        vm.current.publishUpdate({ title: "Primer avance", description: "Se completo el primer hito", milestoneId: hitoId }),
      );

      expect(vm.current.updates).toHaveLength(1);
      expect(vm.current.milestones.find((m) => m.id === hitoId)!.done).toBe(true);
      expect(vm.current.progressPercent).toBe(50);
    });

    it("el porcentaje guardado en el avance ya incluye el hito que cumple", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));
      await run(() => vm.current.addMilestone("Hito 2", new Date(2026, 1, 1)));

      await run(() =>
        vm.current.publishUpdate({
          title: "Cumplo el primero",
          description: "Con hito",
          milestoneId: vm.current.milestones[0].id,
        }),
      );

      // 1 de 2: la foto dice 50, no 0 (que era el porcentaje de antes).
      expect(vm.current.updates[0].completionPercentage).toBe(50);
    });

    it("un avance sin hito guarda el porcentaje que ya habia", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));
      await run(() => vm.current.setMilestoneDone(vm.current.milestones[0].id!, true));

      await run(() => vm.current.publishUpdate({ title: "Sin hito", description: "No cumple ninguno" }));

      expect(vm.current.updates).toHaveLength(1);
      expect(vm.current.updates[0].completionPercentage).toBe(100);
      expect(vm.current.updates[0].milestoneId).toBeNull();
    });

    it("sin hitos el avance guarda 0, no un numero inventado", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));

      await run(() => vm.current.publishUpdate({ title: "Primero", description: "Hola" }));

      expect(vm.current.updates).toHaveLength(1);
      expect(vm.current.updates[0].completionPercentage).toBe(0);
    });

    it("un miembro que no es el lider puede cumplir un hito al publicar", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));
      const hitoId = vm.current.milestones[0].id!;

      profileRepository.current = miembroProfile;
      await run(() => vm.current.open(project));
      await run(() => vm.current.publishUpdate({ title: "Lo logre", description: "Listo", milestoneId: hitoId }));

      expect(vm.current.milestones).toHaveLength(1);
      expect(vm.current.milestones[0].done).toBe(true);
      expect(vm.current.updates[0].completionPercentage).toBe(100);
    });

    it("un visitante no puede publicar", async () => {
      profileRepository.current = visitanteProfile;
      const vm = renderViewModel();
      await run(() => vm.current.open(project));

      await run(() => vm.current.publishUpdate({ title: "Intruso", description: "No" }));

      expect(vm.current.updates).toEqual([]);
    });
  });

  describe("quien entra", () => {
    it("canEnter es true para el lider y para un miembro aceptado", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      expect(vm.current.isLeader).toBe(true);
      expect(vm.current.canEnter).toBe(true);

      profileRepository.current = miembroProfile;
      await run(() => vm.current.open(project));
      expect(vm.current.isLeader).toBe(false);
      expect(vm.current.canEnter).toBe(true);
    });

    it("canEnter es false para quien no lidera ni fue aceptado", async () => {
      profileRepository.current = visitanteProfile;
      const vm = renderViewModel();
      await run(() => vm.current.open(project));

      expect(vm.current.canEnter).toBe(false);
    });

    it("un miembro removido ya no puede entrar", async () => {
      await applicationRepository.repo.decide("a1", "removed");
      profileRepository.current = miembroProfile;
      const vm = renderViewModel();

      await run(() => vm.current.open(project));

      expect(vm.current.canEnter).toBe(false);
    });

    it("abrir otro espacio no deja ver lo del anterior", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));
      expect(vm.current.milestones).not.toEqual([]);

      const otro = newProject({
        id: "p2",
        title: "Otro",
        problem: "",
        description: "",
        stage: "idea",
        academicProgram: "",
        currentMembers: 1,
        maxMembers: 3,
        skillsWanted: [],
        leaderId: "otro-lider",
      });
      let abriendo: Promise<void> = Promise.resolve();
      act(() => {
        abriendo = vm.current.open(otro);
      });

      // Antes de que lleguen los datos ya no hay nada del proyecto anterior.
      expect(vm.current.milestones).toEqual([]);
      expect(vm.current.hasData).toBe(false);
      await run(() => abriendo);
      expect(vm.current.milestones).toEqual([]);
    });

    it("recargar no vacia lo que ya se ve", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      await run(() => vm.current.addMilestone("Hito 1", new Date(2026, 0, 1)));

      let recargando: Promise<void> = Promise.resolve();
      act(() => {
        recargando = vm.current.reload();
      });
      expect(vm.current.hasData).toBe(true);
      expect(vm.current.milestones).not.toEqual([]);
      await run(() => recargando);
      expect(vm.current.milestones).toHaveLength(1);
    });
  });

  describe("salir del proyecto", () => {
    it("un miembro que no lidera sale: queda en left y el contador baja", async () => {
      profileRepository.current = miembroProfile;
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      expect(vm.current.canLeave).toBe(true);
      expect(vm.current.project?.currentMembers).toBe(2);

      let salio = false;
      await run(async () => {
        salio = await vm.current.leave();
      });

      expect(salio).toBe(true);
      expect(estadoDe("a1")).toBe("left");
      expect(projectRepository.project.currentMembers).toBe(1);
    });

    it("el lider no puede salir de su propio proyecto", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      expect(vm.current.canLeave).toBe(false);

      let salio = true;
      await run(async () => {
        salio = await vm.current.leave();
      });

      expect(salio).toBe(false);
      expect(estadoDe("a1")).toBe("accepted");
      expect(projectRepository.project.currentMembers).toBe(2);
    });

    it("un visitante no puede salir de lo que no es suyo", async () => {
      profileRepository.current = visitanteProfile;
      const vm = renderViewModel();
      await run(() => vm.current.open(project));

      let salio = true;
      await run(async () => {
        salio = await vm.current.leave();
      });

      expect(salio).toBe(false);
      expect(projectRepository.project.currentMembers).toBe(2);
    });

    it("el contador nunca baja de 1, que es el lider", async () => {
      profileRepository.current = miembroProfile;
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      projectRepository.project = { ...projectRepository.project, currentMembers: 1 };

      await run(() => vm.current.leave());

      expect(projectRepository.project.currentMembers).toBe(1);
    });
  });

  describe("remover miembros y cambiar la etapa", () => {
    it("el lider remueve: queda en removed y el contador baja", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      const miembro = vm.current.members.find((m) => !m.isLeader)!;

      await run(() => vm.current.removeMember(miembro));

      expect(estadoDe("a1")).toBe("removed");
      expect(projectRepository.project.currentMembers).toBe(1);
      // El equipo recargado ya no lo incluye.
      expect(vm.current.members.filter((m) => !m.isLeader)).toEqual([]);
      expect(vm.current.project?.currentMembers).toBe(1);
    });

    it("un miembro no puede remover a nadie", async () => {
      profileRepository.current = miembroProfile;
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      const miembro = vm.current.members.find((m) => !m.isLeader)!;

      await run(() => vm.current.removeMember(miembro));

      expect(estadoDe("a1")).toBe("accepted");
      expect(projectRepository.project.currentMembers).toBe(2);
    });

    it("el lider no se puede remover a si mismo", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));
      const lider = vm.current.members.find((m) => m.isLeader)!;

      await run(() => vm.current.removeMember(lider));

      expect(projectRepository.project.currentMembers).toBe(2);
    });

    it("el lider cambia la etapa y el view model la recarga", async () => {
      const vm = renderViewModel();
      await run(() => vm.current.open(project));

      await run(() => vm.current.updateStage("research"));

      expect(projectRepository.project.stage).toBe("research");
      expect(vm.current.project?.stage).toBe("research");
    });

    it("un miembro no puede cambiar la etapa", async () => {
      profileRepository.current = miembroProfile;
      const vm = renderViewModel();
      await run(() => vm.current.open(project));

      await run(() => vm.current.updateStage("finished"));

      expect(projectRepository.project.stage).toBe("idea");
    });
  });
});
