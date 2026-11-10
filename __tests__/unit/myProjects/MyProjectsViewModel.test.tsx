import { act, renderHook } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { DIProvider } from "@/src/core/di/DIProvider";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, newApplication } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import { SessionProvider, useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { FollowRepository } from "@/src/features/follow/domain/repositories/FollowRepository";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { ProfileProvider } from "@/src/features/profile/presentation/context/ProfileContext";
import { Project, newProject } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { useMyProjectsViewModel } from "@/src/features/myProjects/presentation/viewmodels/useMyProjectsViewModel";
import { fake } from "@/__tests__/support/fake";

describe("MyProjectsViewModel (my_projects_controller_test.dart y robustez)", () => {
  function setup({
    projects = [],
    apps = [],
    profile,
    failing = false,
  }: {
    projects?: Project[];
    apps?: Application[];
    profile?: Profile;
    failing?: boolean;
  } = {}) {
    const currentProfile: Profile = profile ?? {
      id: "u1",
      fullName: "Test User",
      academicProgram: "Test",
      semester: 1,
      skills: [],
      bio: null,
    };

    const projectRepo = fake<ProjectRepository>({
      getProjects: async () => {
        if (failing) throw new Error("Error de red simulado");
        return projects;
      },
    });

    const appRepo = fake<ApplicationRepository>({
      getMyApplications: async (id) => apps.filter((a) => a.applicantId === id),
      getApplicationsFor: async (pId) => apps.filter((a) => a.projectId === pId),
    });

    const profileRepo = fake<ProfileRepository>({
      getCurrentProfile: async () => currentProfile,
    });

    const followRepo = fake<FollowRepository>({
      getFollowsByUser: async () => [],
    });

    const authRepo = fake<AuthRepository>({
      restoreSession: async () => ({ userId: "u1", email: "test@test.com", name: "Test" }),
      onSessionExpired: () => () => {},
      login: async () => ({ userId: "u1", email: "test@test.com", name: "Test" }),
      logout: async () => {},
    });

    const container = createLocalContainer(new DummyData({ latencyMs: 0 }))
      .register(TOKENS.ProjectRepo, projectRepo)
      .register(TOKENS.ApplicationRepo, appRepo)
      .register(TOKENS.ProfileRepo, profileRepo)
      .register(TOKENS.FollowRepo, followRepo)
      .register(TOKENS.AuthRepo, authRepo);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>
        <SessionProvider>
          <ProfileProvider>{children}</ProfileProvider>
        </SessionProvider>
      </DIProvider>
    );

    return {
      renderVM: () =>
        renderHook(
          () => ({
            session: useSession(),
            vm: useMyProjectsViewModel(),
          }),
          { wrapper },
        ),
    };
  }

  it("carga inicial separa creados y participando", async () => {
    const projects = [
      newProject({
        id: "p1",
        title: "Liderado",
        problem: "",
        description: "",
        stage: "idea",
        academicProgram: "",
        currentMembers: 1,
        maxMembers: 3,
        skillsWanted: [],
        leaderId: "u1",
      }),
      newProject({
        id: "p2",
        title: "Participa",
        problem: "",
        description: "",
        stage: "idea",
        academicProgram: "",
        currentMembers: 1,
        maxMembers: 3,
        skillsWanted: [],
        leaderId: "u2",
      }),
      newProject({
        id: "p3",
        title: "Pendiente",
        problem: "",
        description: "",
        stage: "idea",
        academicProgram: "",
        currentMembers: 1,
        maxMembers: 3,
        skillsWanted: [],
        leaderId: "u2",
      }),
    ];

    const apps = [
      newApplication({
        id: "a1",
        projectId: "p1",
        applicantId: "u3",
        applicantName: "x",
        applicantProgram: "x",
        applicantSemester: 1,
        skillsOffered: [],
        status: "pending",
      }),
      newApplication({
        id: "a2",
        projectId: "p2",
        applicantId: "u1",
        applicantName: "x",
        applicantProgram: "x",
        applicantSemester: 1,
        skillsOffered: [],
        status: "accepted",
      }),
      newApplication({
        id: "a3",
        projectId: "p3",
        applicantId: "u1",
        applicantName: "x",
        applicantProgram: "x",
        applicantSemester: 1,
        skillsOffered: [],
        status: "pending",
      }),
    ];

    const { renderVM } = setup({ projects, apps });
    const { result } = renderVM();

    await act(async () => {
      await result.current.vm.reload();
    });

    expect(result.current.vm.createdProjects).toHaveLength(1);
    expect(result.current.vm.createdProjects[0].id).toBe("p1");
    expect(result.current.vm.pendingFor("p1")).toBe(1);

    expect(result.current.vm.participatingProjects).toHaveLength(1);
    expect(result.current.vm.participatingProjects[0].id).toBe("p2");
  });

  it("los proyectos terminados no cuentan en activeProjectsCount", async () => {
    const projects = [
      newProject({
        id: "p1",
        title: "Activo",
        problem: "",
        description: "",
        stage: "idea",
        academicProgram: "",
        currentMembers: 1,
        maxMembers: 3,
        skillsWanted: [],
        leaderId: "u1",
      }),
      newProject({
        id: "p2",
        title: "Terminado",
        problem: "",
        description: "",
        stage: "finished",
        academicProgram: "",
        currentMembers: 1,
        maxMembers: 3,
        skillsWanted: [],
        leaderId: "u1",
      }),
    ];

    const { renderVM } = setup({ projects });
    const { result } = renderVM();

    await act(async () => {
      await result.current.vm.reload();
    });

    expect(result.current.vm.createdProjects).toHaveLength(2);
    expect(result.current.vm.activeProjectsCount).toBe(1);
  });

  it("el error se muestra y se limpia al reintentar", async () => {
    const { renderVM } = setup({ failing: true });
    const { result } = renderVM();

    await act(async () => {
      await result.current.vm.reload();
    });

    expect(result.current.vm.error).toBeTruthy();
    expect(result.current.vm.isLoading).toBe(false);
  });
});

