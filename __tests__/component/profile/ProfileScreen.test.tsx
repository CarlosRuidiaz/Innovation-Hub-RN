import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { Application } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import { FollowRepository } from "@/src/features/follow/domain/repositories/FollowRepository";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import ProfileScreen from "@/src/features/profile/presentation/screens/ProfileScreen";
import { Project, newProject } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { fake } from "@/__tests__/support/fake";
import { renderScreen } from "@/__tests__/support/renderScreen";

describe("ProfileScreen (profile_view_test.dart y profile_view_error_test.dart)", () => {
  function renderProfile({
    profile,
    projects = [],
    apps = [],
    userId = "1",
    failingProfile = false,
  }: {
    profile?: Profile;
    projects?: Project[];
    apps?: Application[];
    userId?: string;
    failingProfile?: boolean;
  } = {}) {
    const currentProfile: Profile = profile ?? {
      id: userId,
      fullName: "Juan Pérez",
      academicProgram: "Ingeniería",
      semester: 5,
      skills: ["Flutter", "Dart"],
      bio: null,
    };

    let loggedOut = false;

    const profileRepo = fake<ProfileRepository>({
      getCurrentProfile: async () => {
        if (failingProfile) throw new Error("Error de red simulado");
        return currentProfile;
      },
    });

    const projectRepo = fake<ProjectRepository>({
      getProjects: async () => projects,
    });

    const appRepo = fake<ApplicationRepository>({
      getMyApplications: async (uid) => apps.filter((a) => a.applicantId === uid),
      getApplicationsFor: async (pid) => apps.filter((a) => a.projectId === pid),
    });

    const followRepo = fake<FollowRepository>({
      getFollowsByUser: async () => [],
    });

    const authRepo = fake<AuthRepository>({
      restoreSession: async () => ({ userId, email: "juan@uninorte.edu.co", name: "Juan" }),
      onSessionExpired: () => () => {},
      login: async () => ({ userId, email: "juan@uninorte.edu.co", name: "Juan" }),
      logout: async () => {
        loggedOut = true;
      },
    });

    const container = createLocalContainer(new DummyData({ latencyMs: 0 }))
      .register(TOKENS.ProfileRepo, profileRepo)
      .register(TOKENS.ProjectRepo, projectRepo)
      .register(TOKENS.ApplicationRepo, appRepo)
      .register(TOKENS.FollowRepo, followRepo)
      .register(TOKENS.AuthRepo, authRepo);

    return {
      render: () => renderScreen(ProfileScreen, container),
      isLoggedOut: () => loggedOut,
    };
  }

  it("muestra nombre, iniciales, programa y contador de proyectos", async () => {
    const p1 = newProject({
      id: "p1",
      title: "Proyecto 1",
      problem: "",
      description: "",
      stage: "idea",
      academicProgram: "Ingeniería",
      currentMembers: 1,
      maxMembers: 3,
      skillsWanted: [],
      leaderId: "1",
    });

    const { render } = renderProfile({ projects: [p1] });
    render();

    expect(await screen.findByText("JP")).toBeTruthy();
    expect(screen.getByText("Juan Pérez")).toBeTruthy();
    expect(screen.getByText("Ingeniería · 5.º semestre")).toBeTruthy();
    expect(await screen.findByText("1 proyecto activo")).toBeTruthy();
    expect(screen.getByText("Flutter")).toBeTruthy();
    expect(screen.getByText("Dart")).toBeTruthy();
    expect(await screen.findByText("Proyecto 1")).toBeTruthy();
    expect(screen.getByText("Líder")).toBeTruthy();
    expect(screen.getByText("1/3")).toBeTruthy();
  });

  it("con el perfil fallando se ve el mensaje de error y boton reintentar", async () => {
    const { render } = renderProfile({ failingProfile: true });
    render();

    expect(await screen.findByText("No pudimos cargar tu perfil")).toBeTruthy();
    expect(await screen.findByText("Reintentar")).toBeTruthy();
  });

  it("cerrar sesion pide confirmacion y cierra sesion", async () => {
    const { render, isLoggedOut } = renderProfile();
    render();

    const logoutBtn = await screen.findByTestId(ProfileScreen.logoutButtonKey);
    fireEvent.press(logoutBtn);

    const confirmBtn = await screen.findByTestId(ProfileScreen.logoutConfirmButtonKey);
    fireEvent.press(confirmBtn);

    await waitFor(() => {
      expect(isLoggedOut()).toBe(true);
    });
  });
});

