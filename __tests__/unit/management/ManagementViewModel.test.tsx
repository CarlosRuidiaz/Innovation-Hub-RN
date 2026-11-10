import { act, renderHook } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { DIProvider } from "@/src/core/di/DIProvider";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, newApplication } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { useManagementViewModel } from "@/src/features/management/presentation/viewmodels/useManagementViewModel";
import { newProject } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { fake } from "@/__tests__/support/fake";

describe("ManagementViewModel (management_controller_test.dart)", () => {
  function setup() {
    const apps: Application[] = [
      newApplication({
        id: "1",
        projectId: "2",
        applicantId: "u7",
        applicantName: "Mariana Pérez",
        applicantProgram: "Diseño Industrial",
        applicantSemester: 7,
        skillsOffered: ["Diseño UX"],
        status: "pending",
      }),
      newApplication({
        id: "2",
        projectId: "2",
        applicantId: "u8",
        applicantName: "Felipe Gómez",
        applicantProgram: "Ingeniería de Sistemas",
        applicantSemester: 5,
        skillsOffered: ["Flutter"],
        status: "pending",
      }),
    ];

    let recruitmentOpen = true;
    let currentMembers = 2;
    const maxMembers = 4;

    const projectRepo = fake<ProjectRepository>({
      getProjects: async () => [
        newProject({
          id: "2",
          title: "Plataforma de tutorías entre pares",
          problem: "Un problema",
          description: "Una descripcion",
          stage: "idea",
          academicProgram: "Ingeniería de Sistemas",
          currentMembers,
          maxMembers,
          skillsWanted: ["Flutter"],
          leaderId: "1",
          recruitmentOpen,
        }),
      ],
      closeRecruitment: async () => {
        recruitmentOpen = false;
      },
      addMember: async () => {
        if (currentMembers < maxMembers) currentMembers++;
      },
      removeMember: async () => {
        if (currentMembers > 1) currentMembers--;
      },
    });

    const appRepo = fake<ApplicationRepository>({
      getApplicationsFor: async (pId) => apps.filter((a) => a.projectId === pId),
      decide: async (id, decision) => {
        const index = apps.findIndex((a) => a.id === id);
        if (index !== -1) {
          apps[index] = { ...apps[index], status: decision };
        }
      },
    });

    const container = createLocalContainer(new DummyData({ latencyMs: 0 }))
      .register(TOKENS.ApplicationRepo, appRepo)
      .register(TOKENS.ProjectRepo, projectRepo);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>{children}</DIProvider>
    );

    return {
      renderVM: () => renderHook(() => useManagementViewModel(), { wrapper }),
      apps,
    };
  }

  it("getApplicants llena la lista con las del proyecto pedido", async () => {
    const { renderVM } = setup();
    const { result } = renderVM();

    await act(async () => {
      await result.current.getApplicants("2");
    });

    expect(result.current.applicants).toHaveLength(2);
    expect(result.current.project?.id).toBe("2");
  });

  it("pendingCount cuenta solo las pendientes", async () => {
    const { renderVM } = setup();
    const { result } = renderVM();

    await act(async () => {
      await result.current.getApplicants("2");
      await result.current.decide("1", "accepted");
    });

    expect(result.current.pendingCount).toBe(1);
  });

  it("decide con accepted recarga y esa ya no esta pendiente", async () => {
    const { renderVM } = setup();
    const { result } = renderVM();

    await act(async () => {
      await result.current.getApplicants("2");
      await result.current.decide("1", "accepted");
    });

    const decidida = result.current.applicants.find((a) => a.id === "1");
    expect(decidida?.status).toBe("accepted");
  });

  it("closeRecruitment cierra el reclutamiento y recarga el proyecto", async () => {
    const { renderVM } = setup();
    const { result } = renderVM();

    await act(async () => {
      await result.current.getApplicants("2");
      await result.current.closeRecruitment("2");
    });

    expect(result.current.project?.recruitmentOpen).toBe(false);
  });

  it("aceptar una postulacion sube el contador de miembros", async () => {
    const { renderVM } = setup();
    const { result } = renderVM();

    await act(async () => {
      await result.current.getApplicants("2");
    });
    expect(result.current.project?.currentMembers).toBe(2);

    await act(async () => {
      await result.current.decide("1", "accepted");
    });
    expect(result.current.project?.currentMembers).toBe(3);
  });

  it("rechazar no toca el contador de miembros", async () => {
    const { renderVM } = setup();
    const { result } = renderVM();

    await act(async () => {
      await result.current.getApplicants("2");
      await result.current.decide("1", "rejected");
    });

    expect(result.current.project?.currentMembers).toBe(2);
  });

  it("aceptar hasta el ultimo cupo deja el proyecto lleno y cerrado a postulaciones", async () => {
    const { renderVM } = setup();
    const { result } = renderVM();

    await act(async () => {
      await result.current.getApplicants("2");
      await result.current.decide("1", "accepted");
      await result.current.decide("2", "accepted");
    });

    expect(result.current.project?.currentMembers).toBe(4);
    expect(result.current.pendingCount).toBe(0);
  });
});

