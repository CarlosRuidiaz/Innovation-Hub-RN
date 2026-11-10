import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { Container } from "@/src/core/di/container";
import { DIProvider } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Application } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { AppUser } from "@/src/features/auth/domain/entities/AppUser";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import { SessionProvider, useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { newPoll, Poll } from "@/src/features/poll/domain/entities/Poll";
import { newPollResponse, PollResponse } from "@/src/features/poll/domain/entities/PollResponse";
import { PollRepository } from "@/src/features/poll/domain/repositories/PollRepository";
import { usePollViewModel } from "@/src/features/poll/presentation/viewmodels/usePollViewModel";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { newProject, Project } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { fake } from "@/__tests__/support/fake";

// `poll_controller_test.dart`, una por una.

const DAY = 24 * 3600_000;
const inDays = (days: number) => new Date(Date.now() + days * DAY);

class FakePollRepository implements PollRepository {
  polls: Poll[] = [];
  responses: PollResponse[] = [];
  shouldThrow = false;

  async getPollsForProject(projectId: string) {
    if (this.shouldThrow) throw new Error("Error cargando encuestas");
    return this.polls.filter((p) => p.projectId === projectId);
  }

  async createPoll(poll: Poll) {
    if (this.shouldThrow) throw new Error("Error creando encuesta");
    const created = { ...poll, id: `poll_${this.polls.length + 1}` };
    this.polls.push(created);
    return created;
  }

  async getResponsesForPoll(pollId: string) {
    if (this.shouldThrow) throw new Error("Error cargando respuestas");
    return this.responses.filter((r) => r.pollId === pollId);
  }

  async createResponse(response: PollResponse) {
    if (this.shouldThrow) throw new Error("Error guardando respuesta");
    const created = { ...response, id: `resp_${this.responses.length + 1}` };
    this.responses.push(created);
    return created;
  }
}

// En Flutter, `authRepo.getLoggedUser()`. Aqui quien tiene la sesion es el
// usuario que recupera el `SessionProvider` al montarse.
class FakeAuthState {
  currentUser: AppUser | null = null;
  readonly repo = fake<AuthRepository>(
    {
      restoreSession: async () => this.currentUser,
      onSessionExpired: () => () => {},
    },
    "AuthRepository",
  );
}

class FakeProfileRepo implements ProfileRepository {
  currentProfile: Profile = {
    id: "u1",
    fullName: "Ana Perez",
    academicProgram: "Ingenieria de Sistemas",
    semester: 6,
    skills: ["Flutter"],
    bio: null,
  };
  async getCurrentProfile() {
    return this.currentProfile;
  }
}

class FakeProjectRepo {
  projects: Project[] = [];
  readonly repo = fake<ProjectRepository>({ getProjects: async () => this.projects }, "ProjectRepository");
}

class FakeAppRepo {
  applications: Application[] = [];
  readonly repo = fake<ApplicationRepository>(
    {
      getApplicationsFor: async (projectId) => this.applications.filter((a) => a.projectId === projectId),
      getMyApplications: async (applicantId) => this.applications.filter((a) => a.applicantId === applicantId),
    },
    "ApplicationRepository",
  );
}

const user = (userId: string, name: string): AppUser => ({ userId, email: `${userId}@test.com`, name });

describe("PollViewModel", () => {
  let pollRepo: FakePollRepository;
  let authRepo: FakeAuthState;
  let profileRepo: FakeProfileRepo;
  let projectRepo: FakeProjectRepo;
  let appRepo: FakeAppRepo;

  beforeEach(() => {
    pollRepo = new FakePollRepository();
    authRepo = new FakeAuthState();
    profileRepo = new FakeProfileRepo();
    projectRepo = new FakeProjectRepo();
    appRepo = new FakeAppRepo();
  });

  // Se monta con la sesion: el usuario de `authRepo.currentUser` tiene que
  // estar puesto antes, porque se recupera al montarse.
  async function renderViewModel() {
    const container = new Container()
      .register(TOKENS.PollRepo, pollRepo)
      .register(TOKENS.AuthRepo, authRepo.repo)
      .register(TOKENS.ProfileRepo, profileRepo)
      .register(TOKENS.ProjectRepo, projectRepo.repo)
      .register(TOKENS.ApplicationRepo, appRepo.repo);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>
        <SessionProvider>{children}</SessionProvider>
      </DIProvider>
    );
    const { result } = renderHook(() => ({ vm: usePollViewModel(), session: useSession() }), { wrapper });
    await waitFor(() => expect(result.current.session.ready).toBe(true));
    return {
      get vm() {
        return result.current.vm;
      },
    };
  }

  const run = <T,>(step: () => Promise<T>) =>
    act(async () => {
      await step();
    });

  it("loadPollsForProject carga encuestas y respuestas asociadas", async () => {
    pollRepo.polls.push(
      newPoll({ id: "p1", projectId: "proj1", authorId: "u1", title: "Encuesta 1", description: "", questions: [], closesAt: inDays(2) }),
    );
    pollRepo.responses.push(newPollResponse({ id: "r1", pollId: "p1", respondentId: "u2", answers: [0] }));
    const c = await renderViewModel();

    await run(() => c.vm.loadPollsForProject("proj1"));

    expect(c.vm.projectPolls["proj1"]).toHaveLength(1);
    expect(c.vm.pollResponses["p1"]).toHaveLength(1);
    expect(c.vm.isLoading).toBe(false);
  });

  it("isLoading vuelve a false cuando el repositorio falla en loadPollsForProject", async () => {
    pollRepo.shouldThrow = true;
    const c = await renderViewModel();

    await run(() => c.vm.loadPollsForProject("proj1"));

    expect(c.vm.isLoading).toBe(false);
    expect(c.vm.projectPolls["proj1"]).toBeUndefined();
  });

  it("createPoll agrega la encuesta al mapa y apaga isLoading", async () => {
    const c = await renderViewModel();
    const poll = newPoll({ projectId: "proj1", authorId: "u1", title: "Nueva Encuesta", description: "Desc", questions: [], closesAt: inDays(3) });

    let creada: Poll | null = null;
    await run(async () => {
      creada = await c.vm.createPoll(poll);
    });

    expect(creada).not.toBeNull();
    expect(c.vm.projectPolls["proj1"]).toHaveLength(1);
    expect(c.vm.projectPolls["proj1"][0].title).toBe("Nueva Encuesta");
    expect(c.vm.isLoading).toBe(false);
  });

  it("createPoll devuelve null y apaga isLoading cuando falla el repositorio", async () => {
    pollRepo.shouldThrow = true;
    const c = await renderViewModel();
    const poll = newPoll({ projectId: "proj1", authorId: "u1", title: "Falla", description: "", questions: [], closesAt: inDays(1) });

    let resultado: Poll | null = poll;
    await run(async () => {
      resultado = await c.vm.createPoll(poll);
    });

    expect(resultado).toBeNull();
    expect(c.vm.isLoading).toBe(false);
  });

  it("respondPoll guarda respuesta, actualiza mapa y apaga isLoading", async () => {
    const c = await renderViewModel();
    const resp = newPollResponse({ pollId: "poll_1", respondentId: "u2", answers: [1] });

    let creada: PollResponse | null = null;
    await run(async () => {
      creada = await c.vm.respondPoll(resp);
    });

    expect(creada).not.toBeNull();
    expect(c.vm.pollResponses["poll_1"]).toHaveLength(1);
    expect(c.vm.isLoading).toBe(false);
  });

  describe("reglas de respuesta (canRespond)", () => {
    const pollActiva = () =>
      newPoll({
        id: "poll_1",
        projectId: "proj1",
        authorId: "lider",
        title: "Encuesta Activa",
        description: "",
        questions: [],
        closesAt: inDays(5),
        audienceProgram: "Ingenieria de Sistemas",
      });

    it("permite responder si esta activa, dentro de la audiencia y no ha respondido", async () => {
      authRepo.currentUser = user("u1", "Ana");
      profileRepo.currentProfile = { ...profileRepo.currentProfile, id: "u1", academicProgram: "Ingenieria de Sistemas" };
      const c = await renderViewModel();

      expect(await c.vm.canRespond(pollActiva())).toBe(true);
    });

    it("rechaza si la encuesta ya esta cerrada", async () => {
      authRepo.currentUser = user("u1", "Ana");
      const c = await renderViewModel();
      const pollCerrada = newPoll({
        id: "poll_cerrada",
        projectId: "proj1",
        authorId: "lider",
        title: "Cerrada",
        description: "",
        questions: [],
        closesAt: inDays(-1),
      });

      expect(await c.vm.canRespond(pollCerrada)).toBe(false);
    });

    it("rechaza si el usuario ya respondio la encuesta (no responder dos veces)", async () => {
      authRepo.currentUser = user("u1", "Ana");
      // En Flutter la prueba escribia el mapa del controlador a mano; aqui la
      // respuesta va al repositorio y el view model la carga.
      pollRepo.responses.push(newPollResponse({ id: "r1", pollId: "poll_1", respondentId: "u1", answers: [0] }));
      const c = await renderViewModel();
      await run(() => c.vm.loadResponsesForPoll("poll_1"));

      expect(await c.vm.canRespond(pollActiva())).toBe(false);
    });

    it("rechaza si ya respondio aunque sus respuestas no se hayan cargado", async () => {
      authRepo.currentUser = user("u1", "Ana");
      pollRepo.responses.push(newPollResponse({ id: "r1", pollId: "poll_1", respondentId: "u1", answers: [0] }));
      const c = await renderViewModel();

      expect(await c.vm.canRespond(pollActiva())).toBe(false);
    });

    it("rechaza si no se pueden leer las respuestas de la encuesta", async () => {
      authRepo.currentUser = user("u1", "Ana");
      profileRepo.currentProfile = { ...profileRepo.currentProfile, id: "u1", academicProgram: "Ingenieria de Sistemas" };
      const c = await renderViewModel();
      pollRepo.shouldThrow = true;

      expect(await c.vm.canRespond(pollActiva())).toBe(false);
    });

    it("rechaza si el estudiante esta fuera de la audiencia", async () => {
      authRepo.currentUser = user("u2", "Carlos");
      profileRepo.currentProfile = { ...profileRepo.currentProfile, id: "u2", fullName: "Carlos", academicProgram: "Medicina" };
      const c = await renderViewModel();

      expect(await c.vm.canRespond(pollActiva())).toBe(false);
    });

    it("rechaza si no hay sesion iniciada", async () => {
      authRepo.currentUser = null;
      const c = await renderViewModel();

      expect(await c.vm.canRespond(pollActiva())).toBe(false);
    });
  });

  describe("reglas de visualizacion de resultados (canViewResults)", () => {
    it("cualquiera puede ver resultados si la encuesta ya cerro", async () => {
      const c = await renderViewModel();
      const pollCerrada = newPoll({
        id: "p_cerrada",
        projectId: "proj1",
        authorId: "u9",
        title: "Cerrada",
        description: "",
        questions: [],
        closesAt: new Date(Date.now() - 2 * 3600_000),
      });

      expect(await c.vm.canViewResults(pollCerrada)).toBe(true);
    });

    it("quien respondio puede ver resultados aun estando activa", async () => {
      const poll = newPoll({ id: "p_activa", projectId: "proj1", authorId: "lider1", title: "Activa", description: "", questions: [], closesAt: inDays(1) });
      authRepo.currentUser = user("u1", "Ana");
      pollRepo.responses.push(newPollResponse({ id: "r1", pollId: "p_activa", respondentId: "u1", answers: [0] }));
      const c = await renderViewModel();
      await run(() => c.vm.loadResponsesForPoll("p_activa"));

      expect(await c.vm.canViewResults(poll)).toBe(true);
    });

    it("el lider del proyecto puede ver resultados de su encuesta activa", async () => {
      const poll = newPoll({ id: "p_activa", projectId: "proj1", authorId: "lider1", title: "Activa", description: "", questions: [], closesAt: inDays(1) });
      authRepo.currentUser = user("lider1", "Lider");
      projectRepo.projects.push(
        newProject({
          id: "proj1",
          title: "Proyecto 1",
          problem: "",
          description: "",
          stage: "idea",
          academicProgram: "",
          currentMembers: 1,
          maxMembers: 4,
          skillsWanted: [],
          leaderId: "lider1",
        }),
      );
      const c = await renderViewModel();

      expect(await c.vm.canViewResults(poll)).toBe(true);
    });
  });
});
