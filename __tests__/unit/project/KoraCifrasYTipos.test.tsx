import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { DIProvider } from "@/src/core/di/DIProvider";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { SessionProvider } from "@/src/features/auth/presentation/context/SessionContext";
import { ProfileProvider } from "@/src/features/profile/presentation/context/ProfileContext";
import { ProjectDataSource } from "@/src/features/project/data/datasources/ProjectDataSource";
import { ProjectMapper } from "@/src/features/project/data/mappers/ProjectMapper";
import { ProjectRepositoryImpl } from "@/src/features/project/data/repositories/ProjectRepositoryImpl";
import { newProject, Project } from "@/src/features/project/domain/entities/Project";
import { ProjectsProvider, useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { fake } from "@/__tests__/support/fake";

// Kora: las cifras de Explorar, el filtro "Buscan equipo" y el tipo de
// innovacion, con una lista conocida de cinco proyectos.
const base = {
  problem: "P",
  description: "D",
  academicProgram: "Ing. de Sistemas",
  skillsWanted: ["Python"],
  leaderId: "u9",
};
const known: Project[] = [
  newProject({ ...base, id: "a", title: "Idea abierta", stage: "idea", currentMembers: 1, maxMembers: 4 }),
  newProject({ ...base, id: "b", title: "Idea llena", stage: "idea", currentMembers: 3, maxMembers: 3 }),
  newProject({ ...base, id: "c", title: "Prototipo cerrado", stage: "prototype", currentMembers: 2, maxMembers: 5, recruitmentOpen: false }),
  newProject({ ...base, id: "d", title: "Investigacion abierta", stage: "research", currentMembers: 2, maxMembers: 5 }),
  newProject({ ...base, id: "e", title: "Formando equipo", stage: "teamFormation", currentMembers: 1, maxMembers: 3 }),
];

function renderProjects() {
  const data = new DummyData({ latencyMs: 0 });
  data.projects = known.map((p) => ({ ...ProjectMapper.toNewRow(p), _id: p.id }));
  // Solo "a" y "d" tienen fila en `project_types`.
  data.projectTypes = [
    { _id: "t1", project_id: "a", innovation_type: "social" },
    { _id: "t2", project_id: "d", innovation_type: "tecnologica" },
  ];
  const container = createLocalContainer(data);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider container={container}>
      <SessionProvider>
        <ProfileProvider>
          <ProjectsProvider>{children}</ProjectsProvider>
        </ProfileProvider>
      </SessionProvider>
    </DIProvider>
  );
  return renderHook(() => useProjects(), { wrapper });
}

const ids = (list: Project[]) => list.map((p) => p.id).sort();

describe("las cifras de Explorar", () => {
  it("cuentan proyectos, ideas y los que buscan equipo con la lista cargada", async () => {
    const { result } = renderProjects();
    await waitFor(() => expect(result.current.projects).toHaveLength(5));
    // Buscan equipo: abiertos y sin llenar ("a", "d" y "e").
    expect(result.current.stats).toEqual({ projects: 5, ideas: 2, recruiting: 3 });
  });

  it("Ideas deja solo el filtro de etapa Idea y quita los demas", async () => {
    const { result } = renderProjects();
    await waitFor(() => expect(result.current.projects).toHaveLength(5));
    act(() => result.current.applyFilters({ skills: ["Python"], programs: [], stages: ["research"], tags: [], recruiting: true }));
    act(() => result.current.showOnlyIdeas());
    expect(result.current.stageFilters).toEqual(["idea"]);
    expect(result.current.skillFilters).toEqual([]);
    expect(result.current.recruitingOnly).toBe(false);
    expect(ids(result.current.allVisibleProjects)).toEqual(["a", "b"]);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("Buscan equipo activa su filtro y Proyectos los quita todos", async () => {
    const { result } = renderProjects();
    await waitFor(() => expect(result.current.projects).toHaveLength(5));
    act(() => result.current.showRecruiting());
    expect(result.current.recruitingOnly).toBe(true);
    expect(ids(result.current.allVisibleProjects)).toEqual(["a", "d", "e"]);

    act(() => result.current.clearFilters());
    expect(result.current.recruitingOnly).toBe(false);
    expect(result.current.allVisibleProjects).toHaveLength(5);
  });
});

describe("el filtro Buscan equipo", () => {
  it("cuenta en el boton de filtros y se limpia con Limpiar filtros", async () => {
    const { result } = renderProjects();
    await waitFor(() => expect(result.current.projects).toHaveLength(5));
    act(() => result.current.applyFilters({ skills: [], programs: [], stages: ["idea"], tags: [], recruiting: true }));
    expect(result.current.activeFilterCount).toBe(2);
    expect(ids(result.current.allVisibleProjects)).toEqual(["a"]);
    act(() => result.current.clearFilters());
    expect(result.current.activeFilterCount).toBe(0);
  });
});

describe("el tipo de innovacion", () => {
  it("un proyecto con fila recibe su tipo y uno sin fila queda en null", async () => {
    const { result } = renderProjects();
    await waitFor(() => expect(result.current.projects).toHaveLength(5));
    const typeOf = (id: string) => result.current.projects.find((p) => p.id === id)!.innovationType;
    expect(typeOf("a")).toBe("social");
    expect(typeOf("b")).toBeNull();
  });

  it("filtrar por Otros incluye los proyectos sin tipo", async () => {
    const { result } = renderProjects();
    await waitFor(() => expect(result.current.projects).toHaveLength(5));
    act(() => result.current.applyFilters({ skills: [], programs: [], stages: [], tags: [], types: ["otros"] }));
    expect(ids(result.current.allVisibleProjects)).toEqual(["b", "c", "e"]);
    expect(result.current.activeFilterCount).toBe(1);
    act(() => result.current.applyFilters({ skills: [], programs: [], stages: [], tags: [], types: ["social", "tecnologica"] }));
    expect(ids(result.current.allVisibleProjects)).toEqual(["a", "d"]);
  });

  it("si la fila de project_types falla, la idea igual queda creada, sin tipo", async () => {
    const created: object[] = [];
    const repo = new ProjectRepositoryImpl(
      fake<ProjectDataSource>({
        createProject: async (row) => (created.push(row), { ...row, _id: "nuevo" }),
        createProjectType: async () => {
          throw new Error("sin red");
        },
      }),
    );
    const project = await repo.createProject({ ...known[0], id: null, innovationType: "ambiental" });
    expect(project.id).toBe("nuevo");
    expect(project.innovationType).toBeNull();
    expect(created).toHaveLength(1);
    // La fila de `projects` sigue sin columna de tipo: la de Flutter.
    expect(created[0]).not.toHaveProperty("innovation_type");
  });
});
