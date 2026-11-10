import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, newApplication } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { ApplicationAction } from "@/src/features/application/presentation/components/ApplicationAction";
import { ApplySheet } from "@/src/features/application/presentation/components/ApplySheet";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { ProfileRepository } from "@/src/features/profile/domain/repositories/ProfileRepository";
import { Project, newProject } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { fake } from "@/__tests__/support/fake";
import { renderScreen } from "@/__tests__/support/renderScreen";

describe("ApplicationAction", () => {
  function renderAction({
    project,
    profile,
    apps = [],
    userId = "u1",
  }: {
    project: Project;
    profile?: Profile;
    apps?: Application[];
    userId?: string | null;
  }) {
    const currentProfile: Profile = profile ?? {
      id: userId ?? "u1",
      fullName: "Ana Gómez",
      academicProgram: "Diseño",
      semester: 4,
      skills: ["Diseño UX", "Investigación"],
    };

    const appsList = [...apps];
    const appRepo = fake<ApplicationRepository>({
      getMyApplications: async (uid) => appsList.filter((a) => a.applicantId === uid),
      getApplicationsFor: async (pid) => appsList.filter((a) => a.projectId === pid),
      apply: async (app) => {
        const created = { ...app, id: "created_app_1" };
        appsList.push(created);
        return created;
      },
    });

    const profileRepo = fake<ProfileRepository>({
      getCurrentProfile: async () => currentProfile,
    });

    const projectRepo = fake<ProjectRepository>({
      getProjects: async () => [project],
    });

    const authRepo = fake<AuthRepository>({
      restoreSession: async () => (userId ? { userId, email: "ana@uninorte.edu.co", name: "Ana" } : null),
      onSessionExpired: () => () => {},
      login: async () => ({ userId: "u1", email: "ana@uninorte.edu.co", name: "Ana" }),
      logout: async () => {},
    });

    const container = createLocalContainer(new DummyData({ latencyMs: 0 }))
      .register(TOKENS.ApplicationRepo, appRepo)
      .register(TOKENS.ProfileRepo, profileRepo)
      .register(TOKENS.ProjectRepo, projectRepo)
      .register(TOKENS.AuthRepo, authRepo);

    const Component = () => <ApplicationAction project={project} />;
    return {
      render: () => renderScreen(Component, container),
      appsList,
    };
  }

  const baseProject = newProject({
    id: "p1",
    title: "Proyecto 1",
    problem: "",
    description: "",
    stage: "idea",
    academicProgram: "Diseño",
    currentMembers: 1,
    maxMembers: 4,
    skillsWanted: ["Diseño UX", "Python"],
    leaderId: "leader_1",
    recruitmentOpen: true,
  });

  it("muestra 'Postularme' cuando no hay postulacion previa y el estudiante puede postularse", async () => {
    const { render } = renderAction({ project: baseProject, userId: "u1" });
    render();

    expect(await screen.findByTestId(ApplicationAction.applyButtonKey)).toBeTruthy();
    expect(screen.getByText("Postularme")).toBeTruthy();
  });

  it("el lider no ve 'Postularme' ni 'Ver mi postulacion'", async () => {
    const leaderProject = { ...baseProject, leaderId: "u1" };
    const { render } = renderAction({ project: leaderProject, userId: "u1" });
    render();

    await waitFor(() => {
      expect(screen.queryByTestId(ApplicationAction.applyButtonKey)).toBeNull();
      expect(screen.queryByTestId(ApplicationAction.viewButtonKey)).toBeNull();
    });
  });

  it("muestra 'Ver mi postulación' si hay una postulación pendiente o aceptada", async () => {
    const pendingApp = newApplication({
      id: "a1",
      projectId: "p1",
      applicantId: "u1",
      applicantName: "Ana",
      applicantProgram: "Diseño",
      applicantSemester: 4,
      skillsOffered: [],
      status: "pending",
    });

    const { render } = renderAction({ project: baseProject, apps: [pendingApp], userId: "u1" });
    render();

    expect(await screen.findByTestId(ApplicationAction.viewButtonKey)).toBeTruthy();
    expect(screen.getByText("Ver mi postulación")).toBeTruthy();
  });

  it("muestra 'Te removieron de este proyecto.' si fue removido", async () => {
    const removedApp = newApplication({
      id: "a1",
      projectId: "p1",
      applicantId: "u1",
      applicantName: "Ana",
      applicantProgram: "Diseño",
      applicantSemester: 4,
      skillsOffered: [],
      status: "removed",
    });

    const { render } = renderAction({ project: baseProject, apps: [removedApp], userId: "u1" });
    render();

    expect(await screen.findByTestId(ApplicationAction.removedTextKey)).toBeTruthy();
    expect(screen.getByText("Te removieron de este proyecto.")).toBeTruthy();
  });

  it("tocar 'Postularme' abre la hoja con habilidades que coinciden pre-marcadas", async () => {
    const { render } = renderAction({ project: baseProject, userId: "u1" });
    render();

    const applyBtn = await screen.findByTestId(ApplicationAction.applyButtonKey);
    fireEvent.press(applyBtn);

    expect(await screen.findByTestId(ApplySheet.key)).toBeTruthy();
    expect(screen.getByText("Postularme")).toBeTruthy();
    expect(screen.getByText("Proyecto 1")).toBeTruthy();
    expect(screen.getByText("¿CÓMO PUEDES APORTAR?")).toBeTruthy();

    // "Diseño UX" coincide con perfil y debe tener marca
    expect(screen.getByText("✓ Diseño UX")).toBeTruthy();
    // "Python" no coincide con perfil
    expect(screen.getByText("Python")).toBeTruthy();
  });

  it("permite escribir mensaje de hasta 280 caracteres y enviar la postulación", async () => {
    const { render, appsList } = renderAction({ project: baseProject, userId: "u1" });
    render();

    const applyBtn = await screen.findByTestId(ApplicationAction.applyButtonKey);
    fireEvent.press(applyBtn);

    const messageInput = await screen.findByTestId(ApplySheet.messageFieldKey);
    fireEvent.changeText(messageInput, "Me apasiona este proyecto.");

    const sendBtn = screen.getByTestId(ApplySheet.submitButtonKey);
    fireEvent.press(sendBtn);

    await waitFor(() => {
      expect(appsList).toHaveLength(1);
      expect(appsList[0].skillsOffered).toContain("Diseño UX");
      expect(appsList[0].message).toBe("Me apasiona este proyecto.");
    });
  });
});
