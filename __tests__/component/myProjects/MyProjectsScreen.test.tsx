import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, newApplication } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import { FollowRepository } from "@/src/features/follow/domain/repositories/FollowRepository";
import MyProjectsScreen from "@/src/features/myProjects/presentation/screens/MyProjectsScreen";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { Project, newProject } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { fake } from "@/__tests__/support/fake";
import { renderScreen } from "@/__tests__/support/renderScreen";

describe("MyProjectsScreen (my_projects_view_test.dart y Kora 12KB)", () => {
  function renderMyProjects({
    projects = [],
    apps = [],
    userId = "u1",
    onExplore,
    failing = false,
  }: {
    projects?: Project[];
    apps?: Application[];
    userId?: string;
    onExplore?: () => void;
    failing?: boolean;
  } = {}) {
    const profile: Profile = {
      id: userId,
      fullName: "Ana García",
      academicProgram: "Diseño",
      semester: 3,
      skills: [],
    };

    const projectRepo = fake<ProjectRepository>({
      getProjects: async () => {
        if (failing) throw new Error("Error de red simulado");
        return projects;
      },
    });

    const appRepo = fake<ApplicationRepository>({
      getMyApplications: async (uid) => apps.filter((a) => a.applicantId === uid),
      getApplicationsFor: async (pid) => apps.filter((a) => a.projectId === pid),
    });

    const followRepo = fake<FollowRepository>({
      getFollowsByUser: async () => [],
    });

    const profileRepo = fake<ProfileRepository>({
      getCurrentProfile: async () => profile,
    });

    const authRepo = fake<AuthRepository>({
      restoreSession: async () => ({ userId, email: "ana@uninorte.edu.co", name: "Ana" }),
      onSessionExpired: () => () => {},
      login: async () => ({ userId, email: "ana@uninorte.edu.co", name: "Ana" }),
      logout: async () => {},
    });

    const container = createLocalContainer(new DummyData({ latencyMs: 0 }))
      .register(TOKENS.ProjectRepo, projectRepo)
      .register(TOKENS.ApplicationRepo, appRepo)
      .register(TOKENS.FollowRepo, followRepo)
      .register(TOKENS.ProfileRepo, profileRepo)
      .register(TOKENS.AuthRepo, authRepo);

    const Component = () => <MyProjectsScreen onExplore={onExplore} />;
    return {
      render: () => renderScreen(Component, container),
    };
  }

  const baseProject = newProject({
    id: "p1",
    title: "Mi primer proyecto",
    problem: "",
    description: "",
    stage: "idea",
    academicProgram: "Diseño",
    currentMembers: 1,
    maxMembers: 4,
    skillsWanted: [],
    leaderId: "u1",
  });

  it("muestra las pestañas", async () => {
    const { render } = renderMyProjects({ projects: [baseProject] });
    render();

    expect(await screen.findByText("Creados por mí")).toBeTruthy();
    expect(screen.getByText("Donde participo")).toBeTruthy();
    expect(screen.getByText("Siguiendo")).toBeTruthy();
  });

  it("pestaña creados muestra tarjeta con pendientes", async () => {
    const pendingApp = newApplication({
      id: "a1",
      projectId: "p1",
      applicantId: "u2",
      applicantName: "x",
      applicantProgram: "x",
      applicantSemester: 1,
      skillsOffered: [],
      status: "pending",
    });

    const { render } = renderMyProjects({ projects: [baseProject], apps: [pendingApp] });
    render();

    expect(await screen.findByText("Mi primer proyecto")).toBeTruthy();
    expect(screen.getByText("1 pendiente")).toBeTruthy();
  });

  it("pestaña creados vacia muestra mensaje y boton", async () => {
    const { render } = renderMyProjects({ projects: [] });
    render();

    expect(await screen.findByText("Todavía no has creado proyectos")).toBeTruthy();
    expect(screen.getByText("Publicar una idea")).toBeTruthy();
  });

  it("pestaña donde participo vacia muestra mensaje", async () => {
    const { render } = renderMyProjects();
    render();

    const tab = await screen.findByTestId(MyProjectsScreen.participatingTabKey);
    fireEvent.press(tab);

    expect(await screen.findByText("Todavía no participas en ningún proyecto")).toBeTruthy();
    expect(screen.getByText("Explorar proyectos")).toBeTruthy();
  });

  it("el boton Explorar proyectos llama a onExplore", async () => {
    let called = false;
    const { render } = renderMyProjects({ onExplore: () => { called = true; } });
    render();

    const tab = await screen.findByTestId(MyProjectsScreen.participatingTabKey);
    fireEvent.press(tab);

    const btn = await screen.findByText("Explorar proyectos");
    fireEvent.press(btn);

    expect(called).toBe(true);
  });

  it("Kora 12KB: donde participo agrupa postulaciones en revision y equipos", async () => {
    const projTutorias = newProject({
      id: "p_tutorias",
      title: "Sistema de tutorías entre pares",
      problem: "",
      description: "",
      stage: "idea",
      academicProgram: "Sistemas",
      currentMembers: 1,
      maxMembers: 4,
      skillsWanted: [],
      leaderId: "u_lider",
    });

    const projEquipos = newProject({
      id: "p_movilidad",
      title: "App de movilidad sostenible en el campus",
      problem: "",
      description: "",
      stage: "prototype",
      academicProgram: "Diseño Industrial",
      currentMembers: 4,
      maxMembers: 6,
      skillsWanted: [],
      leaderId: "u_lider",
    });

    const appRevision = newApplication({
      id: "a_rev",
      projectId: "p_tutorias",
      applicantId: "u1",
      applicantName: "Ana",
      applicantProgram: "Diseño",
      applicantSemester: 3,
      skillsOffered: ["Diseño UX", "Investigación"],
      status: "pending",
    });

    const appAceptada = newApplication({
      id: "a_ok",
      projectId: "p_movilidad",
      applicantId: "u1",
      applicantName: "Ana",
      applicantProgram: "Diseño",
      applicantSemester: 3,
      skillsOffered: ["Diseño UX"],
      status: "accepted",
    });

    const { render } = renderMyProjects({
      projects: [projTutorias, projEquipos],
      apps: [appRevision, appAceptada],
    });
    render();

    const tab = await screen.findByTestId(MyProjectsScreen.participatingTabKey);
    fireEvent.press(tab);

    expect(await screen.findByText("TUS POSTULACIONES · 1 EN REVISIÓN")).toBeTruthy();
    expect(screen.getByText("Sistema de tutorías entre pares")).toBeTruthy();
    expect(screen.getByText("Aportas: Diseño UX · Investigación")).toBeTruthy();
    expect(screen.getByText("EN REVISIÓN")).toBeTruthy();

    expect(screen.getByText("TUS EQUIPOS")).toBeTruthy();
    expect(screen.getByText("App de movilidad sostenible en el campus")).toBeTruthy();
  });

  it("estado de error muestra mensaje y reintentar", async () => {
    const { render } = renderMyProjects({ failing: true });
    render();

    expect(await screen.findByText("No pudimos cargar tus proyectos")).toBeTruthy();
    expect(screen.getByText("Reintentar")).toBeTruthy();
  });
});
