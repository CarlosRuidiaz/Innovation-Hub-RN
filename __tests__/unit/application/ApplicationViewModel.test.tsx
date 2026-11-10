import { act, renderHook } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { DIProvider } from "@/src/core/di/DIProvider";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { ApplicationDataSource } from "@/src/features/application/data/datasources/ApplicationDataSource";
import { ApplicationRepositoryImpl } from "@/src/features/application/data/repositories/ApplicationRepositoryImpl";
import { Application, newApplication } from "@/src/features/application/domain/entities/Application";
import { useApplicationViewModel } from "@/src/features/application/presentation/viewmodels/useApplicationViewModel";
import { Project, newProject } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { fake } from "@/__tests__/support/fake";

const postulacion = (projectId: string, applicantId: string, name = "Estudiante"): Application =>
  newApplication({
    projectId,
    applicantId,
    applicantName: name,
    applicantProgram: "Ing. de Sistemas",
    applicantSemester: 5,
    skillsOffered: [],
  });

describe("ApplicationViewModel (application_controller_test.dart)", () => {
  function setup({
    projects = [],
    initialApps = [],
  }: {
    projects?: Project[];
    initialApps?: Application[];
  } = {}) {
    const appsList = [...initialApps];
    const appSource = fake<ApplicationDataSource>({
      readApplications: async (filter) =>
        appsList.filter((a) =>
          Object.entries(filter).every(([k, v]) => (a as any)[k === "applicant_id" ? "applicantId" : k] === v),
        ).map((a) => ({
          _id: a.id,
          project_id: a.projectId,
          applicant_id: a.applicantId,
          applicant_name: a.applicantName,
          applicant_program: a.applicantProgram,
          applicant_semester: a.applicantSemester,
          skills_offered: JSON.stringify(a.skillsOffered),
          status: a.status,
        })),
      readApplicationMessages: async () => [],
      createApplication: async (row) => {
        const id = `app_${appsList.length + 1}`;
        const created: Application = {
          id,
          projectId: String(row.project_id),
          applicantId: String(row.applicant_id),
          applicantName: String(row.applicant_name),
          applicantProgram: String(row.applicant_program),
          applicantSemester: Number(row.applicant_semester),
          skillsOffered: JSON.parse(String(row.skills_offered)),
          status: "pending",
          message: null,
        };
        appsList.push(created);
        return { ...row, _id: id };
      },
      createApplicationMessage: async (row) => ({ ...row, _id: "msg_1" }),
      updateApplication: async (id, changes) => {
        const found = appsList.find((a) => a.id === id);
        if (found && changes.status) {
          found.status = changes.status as any;
        }
      },
    });

    const appRepo = new ApplicationRepositoryImpl(appSource);
    const projectRepo = fake<ProjectRepository>({
      getProjects: async () => projects,
    });

    const container = createLocalContainer(new DummyData({ latencyMs: 0 }))
      .register(TOKENS.ApplicationRepo, appRepo)
      .register(TOKENS.ProjectRepo, projectRepo);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>{children}</DIProvider>
    );

    return {
      renderVM: () => renderHook(() => useApplicationViewModel(), { wrapper }),
      appsList,
    };
  }

  it("apply no crea nada si el postulante es el líder", async () => {
    const project = newProject({
      id: "p2",
      title: "Proyecto 2",
      problem: "",
      description: "",
      stage: "idea",
      academicProgram: "Sistemas",
      currentMembers: 1,
      maxMembers: 4,
      skillsWanted: [],
      leaderId: "user_lider",
    });

    const { renderVM, appsList } = setup({ projects: [project] });
    const { result } = renderVM();

    let created: Application | null = null;
    await act(async () => {
      created = await result.current.apply(postulacion("p2", "user_lider"));
    });

    expect(created).toBeNull();
    expect(appsList).toHaveLength(0);
  });

  it("quien no lidera si se postula", async () => {
    const project = newProject({
      id: "p5",
      title: "Proyecto 5",
      problem: "",
      description: "",
      stage: "idea",
      academicProgram: "Sistemas",
      currentMembers: 1,
      maxMembers: 4,
      skillsWanted: [],
      leaderId: "otro_lider",
    });

    const { renderVM } = setup({ projects: [project] });
    const { result } = renderVM();

    let created: Application | null = null;
    await act(async () => {
      created = await result.current.apply(postulacion("p5", "u9"));
    });

    expect(created).not.toBeNull();
    expect(created?.status).toBe("pending");
    expect(result.current.vigenteEn("p5")?.id).toBe(created?.id);
  });

  it("una postulacion en left no es vigente y puede volver a postularse", async () => {
    const project = newProject({
      id: "p5",
      title: "Proyecto 5",
      problem: "",
      description: "",
      stage: "idea",
      academicProgram: "Sistemas",
      currentMembers: 1,
      maxMembers: 4,
      skillsWanted: [],
      leaderId: "lider",
    });

    const { renderVM, appsList } = setup({ projects: [project] });
    const { result } = renderVM();

    let created: Application | null = null;
    await act(async () => {
      created = await result.current.apply(postulacion("p5", "u9"));
    });

    // Cambiamos a left
    const inList = appsList.find((a) => a.id === created?.id);
    if (inList) inList.status = "left";

    await act(async () => {
      await result.current.getMyApplications("u9");
    });

    expect(result.current.vigenteEn("p5")).toBeNull();
    expect(result.current.fueRemovidoDe("p5")).toBe(false);

    let otra: Application | null = null;
    await act(async () => {
      otra = await result.current.apply(postulacion("p5", "u9"));
    });

    expect(otra?.id).not.toBe(created?.id);
    expect(otra?.status).toBe("pending");
  });

  it("un removido lo sabe el viewmodel y no vuelve a postularse", async () => {
    const project = newProject({
      id: "p5",
      title: "Proyecto 5",
      problem: "",
      description: "",
      stage: "idea",
      academicProgram: "Sistemas",
      currentMembers: 1,
      maxMembers: 4,
      skillsWanted: [],
      leaderId: "lider",
    });

    const { renderVM, appsList } = setup({ projects: [project] });
    const { result } = renderVM();

    let created: Application | null = null;
    await act(async () => {
      created = await result.current.apply(postulacion("p5", "u9"));
    });

    const inList = appsList.find((a) => a.id === created?.id);
    if (inList) inList.status = "removed";

    await act(async () => {
      await result.current.getMyApplications("u9");
    });

    expect(result.current.fueRemovidoDe("p5")).toBe(true);
    expect(result.current.fueRemovidoDe("p2")).toBe(false);
    expect(result.current.vigenteEn("p5")).toBeNull();

    let intento: Application | null = null;
    await act(async () => {
      intento = await result.current.apply(postulacion("p5", "u9"));
    });

    expect(intento?.id).toBe(created?.id);
    expect(intento?.status).toBe("removed");
  });

  it("withdraw sin saber de quien es no falla", async () => {
    const { renderVM } = setup();
    const { result } = renderVM();

    await act(async () => {
      await result.current.withdraw("1");
    });

    expect(result.current.myApplications).toHaveLength(0);
  });
});
