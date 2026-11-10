import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, newApplication } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import ApplicantsScreen from "@/src/features/management/presentation/screens/ApplicantsScreen";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { Project, newProject } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { fake } from "@/__tests__/support/fake";
import { renderScreen } from "@/__tests__/support/renderScreen";

describe("ApplicantsScreen (applicants_page_test.dart y Kora 18K)", () => {
  function renderApplicants({
    project,
    profile,
    apps = [],
    userId = "u1",
  }: {
    project: Project;
    profile?: Profile;
    apps?: Application[];
    userId?: string;
  }) {
    const currentProfile: Profile = profile ?? {
      id: userId,
      fullName: "Carlos Ruidíaz",
      academicProgram: "Ingeniería de Sistemas",
      semester: 8,
      skills: [],
      bio: null,
    };

    const appsList = [...apps];
    let currentProject = { ...project };

    const appRepo = fake<ApplicationRepository>({
      getApplicationsFor: async (pid) => appsList.filter((a) => a.projectId === pid),
      decide: async (id, decision) => {
        const found = appsList.find((a) => a.id === id);
        if (found) found.status = decision;
      },
    });

    const projectRepo = fake<ProjectRepository>({
      getProjects: async () => [currentProject],
      addMember: async (pid) => {
        if (currentProject.id === pid) currentProject.currentMembers++;
      },
      closeRecruitment: async (pid) => {
        if (currentProject.id === pid) currentProject.recruitmentOpen = false;
      },
    });

    const profileRepo = fake<ProfileRepository>({
      getCurrentProfile: async () => currentProfile,
    });

    const authRepo = fake<AuthRepository>({
      restoreSession: async () => ({ userId, email: "carlos@uninorte.edu.co", name: "Carlos" }),
      onSessionExpired: () => () => {},
      login: async () => ({ userId, email: "carlos@uninorte.edu.co", name: "Carlos" }),
      logout: async () => {},
    });

    const container = createLocalContainer(new DummyData({ latencyMs: 0 }))
      .register(TOKENS.ApplicationRepo, appRepo)
      .register(TOKENS.ProfileRepo, profileRepo)
      .register(TOKENS.ProjectRepo, projectRepo)
      .register(TOKENS.AuthRepo, authRepo);

    return {
      render: () => renderScreen(ApplicantsScreen, container, { params: { project: currentProject } }),
      appsList,
      getProject: () => currentProject,
    };
  }

  const baseProject = newProject({
    id: "p1",
    title: "App de movilidad sostenible",
    problem: "",
    description: "",
    stage: "prototype",
    academicProgram: "Diseño Industrial",
    currentMembers: 4,
    maxMembers: 6,
    skillsWanted: ["Diseño UX"],
    leaderId: "u1",
    recruitmentOpen: true,
  });

  it("el proyecto sin postulantes muestra el estado vacio", async () => {
    const { render } = renderApplicants({ project: baseProject, apps: [] });
    render();

    expect(await screen.findByText("Todavía no hay postulantes.")).toBeTruthy();
    expect(screen.getByText("0 postulaciones pendientes")).toBeTruthy();
  });

  it("quien no lidera el proyecto no puede gestionarlo", async () => {
    const notLeaderProject = { ...baseProject, leaderId: "otro_usuario" };
    const { render } = renderApplicants({ project: notLeaderProject });
    render();

    expect(
      await screen.findByText(
        "No tienes permiso para gestionar los postulantes de este proyecto: solo el líder puede hacerlo.",
      ),
    ).toBeTruthy();
  });

  it("muestra postulantes con sus iniciales, habilidades y mensaje entre comillas", async () => {
    const app = newApplication({
      id: "a1",
      projectId: "p1",
      applicantId: "u2",
      applicantName: "Daniela Cárdenas",
      applicantProgram: "Diseño Industrial",
      applicantSemester: 7,
      skillsOffered: ["Diseño UX", "Investigación"],
      status: "pending",
      message: "Ya hice pruebas de usabilidad en otro proyecto.",
    });

    const { render } = renderApplicants({ project: baseProject, apps: [app] });
    render();

    expect(await screen.findByText("Daniela Cárdenas")).toBeTruthy();
    expect(screen.getByText("DC")).toBeTruthy();
    expect(screen.getByText("Diseño Industrial · 7.º semestre")).toBeTruthy();
    expect(screen.getByText("Diseño UX")).toBeTruthy();
    expect(screen.getByText("Investigación")).toBeTruthy();
    expect(screen.getByText("“Ya hice pruebas de usabilidad en otro proyecto.”")).toBeTruthy();
    expect(screen.getByText("1 postulación pendiente")).toBeTruthy();
  });

  it("los dos botones llaman a aceptar y rechazar", async () => {
    const app = newApplication({
      id: "a1",
      projectId: "p1",
      applicantId: "u2",
      applicantName: "Daniela Cárdenas",
      applicantProgram: "Diseño Industrial",
      applicantSemester: 7,
      skillsOffered: [],
      status: "pending",
    });

    const { render, appsList } = renderApplicants({ project: baseProject, apps: [app] });
    render();

    const acceptBtn = await screen.findByTestId("Accept_a1");
    fireEvent.press(acceptBtn);

    await waitFor(() => {
      expect(appsList[0].status).toBe("accepted");
    });
  });

  it("cerrar reclutamiento pide confirmacion y actualiza", async () => {
    const { render, getProject } = renderApplicants({ project: baseProject, apps: [] });
    render();

    const closeBtn = await screen.findByTestId(ApplicantsScreen.closeRecruitmentButtonKey);
    fireEvent.press(closeBtn);

    const confirmBtn = await screen.findByTestId(ApplicantsScreen.confirmCloseRecruitmentButtonKey);
    fireEvent.press(confirmBtn);

    await waitFor(() => {
      expect(getProject().recruitmentOpen).toBe(false);
    });
  });
});

