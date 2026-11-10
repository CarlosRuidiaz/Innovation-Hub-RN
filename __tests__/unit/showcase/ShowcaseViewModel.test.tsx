import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { DIProvider } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, newApplication } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { AppUser } from "@/src/features/auth/domain/entities/AppUser";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import { SessionProvider, useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { ProfileProvider } from "@/src/features/profile/presentation/context/ProfileContext";
import { newProject, Project } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { ShowcaseInMemoryDataSource } from "@/src/features/showcase/data/datasources/ShowcaseInMemoryDataSource";
import { ShowcaseRepositoryImpl } from "@/src/features/showcase/data/repositories/ShowcaseRepositoryImpl";
import { isEmptySummary } from "@/src/features/showcase/domain/entities/FeedbackSummary";
import { usePrototypeDetailViewModel } from "@/src/features/showcase/presentation/viewmodels/usePrototypeDetailViewModel";
import { SHOWCASE_ERROR, useShowcaseViewModel } from "@/src/features/showcase/presentation/viewmodels/useShowcaseViewModel";
import { fake } from "@/__tests__/support/fake";

// `showcase_controller_test.dart`: las reglas de la vitrina con repositorios
// falsos y la vitrina en memoria, vacia.

const prototypeProject = newProject({
  id: "proto_1",
  title: "App de movilidad sostenible",
  problem: "Movilidad en campus",
  description: "Prototipo navegable",
  stage: "prototype",
  academicProgram: "Diseño Industrial",
  currentMembers: 3,
  maxMembers: 5,
  skillsWanted: ["UX"],
  leaderId: "leader_1",
});

const ideaProject = newProject({
  id: "idea_1",
  title: "Red de tutorías",
  problem: "Tutorías",
  description: "Idea de tutorías",
  stage: "idea",
  academicProgram: "Sistemas",
  currentMembers: 1,
  maxMembers: 4,
  skillsWanted: ["Dart"],
  leaderId: "other_user",
});

// Las cuentas de la prueba: su `userId` es el `id` de su perfil.
const profiles: Record<string, Profile> = {
  student_1: { id: "student_1", fullName: "Laura Peñaloza", academicProgram: "Psicología", semester: 6, skills: [], bio: null },
  leader_1: { id: "leader_1", fullName: "Líder del proyecto", academicProgram: "Diseño", semester: 8, skills: [], bio: null },
  member_accepted: { id: "member_accepted", fullName: "Miembro", academicProgram: "Sistemas", semester: 7, skills: [], bio: null },
};

const userOf = (id: string): AppUser => ({ userId: id, email: `${id}@uninorte.edu.co`, name: profiles[id].fullName });

function setup({ startAs = "student_1", projects = [prototypeProject, ideaProject] as Project[] | Error } = {}) {
  let current: string | null = startAs;
  const applications: Application[] = [];

  const auth = fake<AuthRepository>({
    restoreSession: async () => (current ? userOf(current) : null),
    onSessionExpired: () => () => {},
    login: async (email) => {
      current = email.split("@")[0];
      return userOf(current);
    },
    logout: async () => {
      current = null;
    },
  });
  const profileRepo = fake<ProfileRepository>({
    getCurrentProfile: async () => {
      if (!current) throw new Error("sin sesion");
      return profiles[current];
    },
  });
  const projectRepo = fake<ProjectRepository>({
    getProjects: async () => {
      if (projects instanceof Error) throw projects;
      return projects;
    },
  });
  const applicationRepo = fake<ApplicationRepository>({
    getApplicationsFor: async (projectId) => applications.filter((a) => a.projectId === projectId),
  });
  const data = new DummyData({ latencyMs: 0 });
  data.comments = [];
  data.feedback = [];
  const showcaseRepo = new ShowcaseRepositoryImpl(new ShowcaseInMemoryDataSource(data));

  const container = new Container()
    .register(TOKENS.AuthRepo, auth)
    .register(TOKENS.ProfileRepo, profileRepo)
    .register(TOKENS.ProjectRepo, projectRepo)
    .register(TOKENS.ApplicationRepo, applicationRepo)
    .register(TOKENS.ShowcaseRepo, showcaseRepo);

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider container={container}>
      <SessionProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </SessionProvider>
    </DIProvider>
  );
  return { wrapper, applications, data };
}

function renderDetail(options?: Parameters<typeof setup>[0]) {
  const env = setup(options);
  const hook = renderHook(
    () => ({ session: useSession(), detail: usePrototypeDetailViewModel(prototypeProject) }),
    { wrapper: env.wrapper },
  );
  return { ...env, ...hook };
}

type Rendered = ReturnType<typeof renderDetail>["result"];

// Abre el prototipo como `userId`: cambia de cuenta y espera a que el detalle
// sea de esa cuenta.
async function openAs(result: Rendered, userId: string) {
  if (result.current.session.user?.userId !== userId) {
    await act(async () => {
      await result.current.session.login(`${userId}@uninorte.edu.co`, "Clave!2026");
    });
  }
  await waitForDetailOf(result, userId);
}

// El detalle cargado: el perfil es el de la cuenta y ya se leyo el hilo.
async function waitForDetailOf(result: Rendered, userId: string) {
  await waitFor(() => expect(result.current.session.user?.userId).toBe(userId));
  await waitFor(() => expect(result.current.detail.isLoading).toBe(false));
}

// Carga la vitrina y deja llegar las cifras, que se piden sin esperar, como en
// Flutter.
async function loadShowcase(result: { current: ReturnType<typeof useShowcaseViewModel> }) {
  await act(async () => {
    await result.current.load();
  });
  await act(async () => {});
}

describe("ShowcaseViewModel - reglas de negocio y permisos", () => {
  it("1 · la vitrina muestra solo proyectos en etapa Prototype", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useShowcaseViewModel(), { wrapper });
    await loadShowcase(result);
    expect(result.current.prototypes).toHaveLength(1);
    expect(result.current.prototypes[0].id).toBe("proto_1");
    expect(result.current.prototypes[0].stage).toBe("prototype");
  });

  it("la vitrina cuenta los comentarios y el promedio de cada prototipo", async () => {
    const { wrapper, data } = setup();
    data.comments.push({ _id: "c1", project_id: "proto_1", author_id: "u", author_name: "Ana", text: "Hola", is_team: false, created_at: "2026-01-01T10:00:00.000" });
    data.feedback.push({ _id: "f1", project_id: "proto_1", author_id: "u", author_name: "Ana", usability: 4, innovation: 4, visual_design: 4, feasibility: 4, created_at: "2026-01-01T10:00:00.000" });
    const { result } = renderHook(() => useShowcaseViewModel(), { wrapper });
    await loadShowcase(result);
    await waitFor(() => expect(result.current.statsFor("proto_1").commentCount).toBe(1));
    expect(result.current.statsFor("proto_1").overallAverage).toBe(4);
    expect(result.current.statsFor("proto_1").feedbackCount).toBe(1);
  });

  it("si no se pueden leer los proyectos muestra el error de Flutter", async () => {
    const { wrapper } = setup({ projects: new Error("caido") });
    const { result } = renderHook(() => useShowcaseViewModel(), { wrapper });
    await loadShowcase(result);
    expect(result.current.error).toBe(SHOWCASE_ERROR);
    expect(result.current.prototypes).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("2 · el lider y los miembros aceptados son identificados como equipo", async () => {
    const { result, applications } = renderDetail();

    // Estudiante externo.
    await openAs(result, "student_1");
    expect(result.current.detail.isTeamMember).toBe(false);

    // Lider.
    await openAs(result, "leader_1");
    await waitFor(() => expect(result.current.detail.isTeamMember).toBe(true));

    // Miembro aceptado.
    applications.push(
      newApplication({
        id: "app_1",
        projectId: "proto_1",
        applicantId: "member_accepted",
        applicantName: "Miembro",
        applicantProgram: "Sistemas",
        applicantSemester: 7,
        skillsOffered: [],
        status: "accepted",
      }),
    );
    await openAs(result, "member_accepted");
    await waitFor(() => expect(result.current.detail.isTeamMember).toBe(true));
  });

  it("3 · solo el equipo puede responder y las respuestas quedan asociadas", async () => {
    const { result } = renderDetail();

    // Un estudiante externo crea un comentario raiz.
    await openAs(result, "student_1");
    let commented = false;
    await act(async () => {
      commented = await result.current.detail.addComment("¿Cómo funciona el cupo?");
    });
    expect(commented).toBe(true);
    expect(result.current.detail.rootComments).toHaveLength(1);
    const root = result.current.detail.rootComments[0];

    // El estudiante externo intenta responder: se rechaza.
    let externalReply = true;
    await act(async () => {
      externalReply = await result.current.detail.addComment("Intento externo de responder", root.id);
    });
    expect(externalReply).toBe(false);

    // El lider, que es del equipo, responde.
    await openAs(result, "leader_1");
    await waitFor(() => expect(result.current.detail.isTeamMember).toBe(true));
    let leaderReply = false;
    await act(async () => {
      leaderReply = await result.current.detail.addComment("El conductor confirma antes de reservar.", root.id);
    });
    expect(leaderReply).toBe(true);

    // La respuesta quedo bajo el comentario raiz.
    const replies = result.current.detail.repliesFor(root.id!);
    expect(replies).toHaveLength(1);
    expect(replies[0].text).toBe("El conductor confirma antes de reservar.");
    expect(replies[0].isTeam).toBe(true);
    expect(replies[0].parentId).toBe(root.id);
    expect(result.current.detail.rootComments).toHaveLength(1);
  });

  it("no se responde a una respuesta: un solo nivel", async () => {
    const { result } = renderDetail({ startAs: "leader_1" });
    await openAs(result, "leader_1");
    await waitFor(() => expect(result.current.detail.isTeamMember).toBe(true));
    await act(async () => {
      await result.current.detail.addComment("Raiz");
    });
    const root = result.current.detail.rootComments[0];
    await act(async () => {
      await result.current.detail.addComment("Respuesta", root.id);
    });
    const reply = result.current.detail.repliesFor(root.id!)[0];
    let nested = true;
    await act(async () => {
      nested = await result.current.detail.addComment("Respuesta a la respuesta", reply.id);
    });
    expect(nested).toBe(false);
  });

  it("4 · el equipo no puede calificar su propio proyecto", async () => {
    const { result } = renderDetail({ startAs: "leader_1" });
    await openAs(result, "leader_1");
    await waitFor(() => expect(result.current.detail.isTeamMember).toBe(true));

    let sent = true;
    await act(async () => {
      sent = await result.current.detail.submitFeedback({ usability: 5, innovation: 5, visualDesign: 5, feasibility: 5 });
    });
    expect(sent).toBe(false);
    expect(result.current.detail.feedbackList).toEqual([]);
  });

  it("5 · un segundo feedback del mismo estudiante actualiza el primero", async () => {
    const { result } = renderDetail();
    await openAs(result, "student_1");

    let first = false;
    await act(async () => {
      first = await result.current.detail.submitFeedback({
        usability: 3,
        innovation: 3,
        visualDesign: 3,
        feasibility: 3,
        comment: "Primer intento",
      });
    });
    expect(first).toBe(true);
    expect(result.current.detail.feedbackList).toHaveLength(1);
    expect(result.current.detail.feedbackSummary.overallAverage).toBe(3);

    let second = false;
    await act(async () => {
      second = await result.current.detail.submitFeedback({
        usability: 5,
        innovation: 5,
        visualDesign: 5,
        feasibility: 5,
        comment: "Segundo intento mejorado",
      });
    });
    expect(second).toBe(true);
    expect(result.current.detail.feedbackList).toHaveLength(1);
    expect(result.current.detail.feedbackSummary.overallAverage).toBe(5);
    expect(result.current.detail.myFeedback?.comment).toBe("Segundo intento mejorado");
  });

  it("6 · los promedios del resumen son correctos sin ningun feedback", async () => {
    const { result } = renderDetail();
    await openAs(result, "student_1");
    expect(result.current.detail.feedbackList).toEqual([]);
    expect(isEmptySummary(result.current.detail.feedbackSummary)).toBe(true);
    expect(result.current.detail.feedbackSummary.totalCount).toBe(0);
    expect(result.current.detail.feedbackSummary.overallAverage).toBe(0);
  });

  it("7 · cerrar sesion vacia el equipo, los comentarios y el feedback", async () => {
    const { result } = renderDetail({ startAs: "leader_1" });
    await openAs(result, "leader_1");
    await waitFor(() => expect(result.current.detail.isTeamMember).toBe(true));
    await act(async () => {
      await result.current.detail.addComment("Antes de salir");
    });
    expect(result.current.detail.comments).toHaveLength(1);

    await act(async () => {
      await result.current.session.logout();
    });

    // La cuenta siguiente no hereda nada de quien salio.
    expect(result.current.session.user).toBeNull();
    expect(result.current.detail.isTeamMember).toBe(false);
    expect(result.current.detail.myFeedback).toBeNull();
    expect(result.current.detail.comments).toEqual([]);
  });
});
