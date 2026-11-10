import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { AppCatalogs } from "@/src/core/catalogs";
import { DIProvider } from "@/src/core/di/DIProvider";
import { SnackbarProvider } from "@/src/core/feedback/SnackbarProvider";
import { SessionProvider } from "@/src/features/auth/presentation/context/SessionContext";
import { ProjectsProvider, useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { safeAreaMetrics } from "@/__tests__/support/renderScreen";

// Envuelve el hook con todos los proveedores necesarios.
function wrapper({ children }: { children: React.ReactNode }) {
  const data = new DummyData({ latencyMs: 0 });
  const container = createLocalContainer(data);
  return (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <DIProvider container={container}>
        <SnackbarProvider>
          <SessionProvider>
            <ProjectsProvider>{children}</ProjectsProvider>
          </SessionProvider>
        </SnackbarProvider>
      </DIProvider>
    </SafeAreaProvider>
  );
}

// Equivale a `project_controller_test.dart` y `tag_filters_test.dart`.
describe("ProjectsContext", () => {
  it("carga la lista de proyectos al montar", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));
    expect(result.current.isLoading).toBe(false);
  });

  it("allVisibleProjects sin filtros devuelve todos los proyectos", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));
    expect(result.current.allVisibleProjects.length).toBe(result.current.projects.length);
  });

  it("filtrar por habilidad deja solo los proyectos que la piden", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));

    act(() => {
      result.current.applyFilters({
        skills: [AppCatalogs.skillData],
        programs: [],
        stages: [],
        tags: [],
      });
    });

    const visible = result.current.allVisibleProjects;
    expect(visible.length).toBeGreaterThan(0);
    visible.forEach((p) => {
      expect(p.skillsWanted.some((s) => s === AppCatalogs.skillData)).toBe(true);
    });
  });

  it("filtrar por etapa 'idea' deja solo los de etapa idea", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));

    act(() => {
      result.current.applyFilters({
        skills: [],
        programs: [],
        stages: ["idea"],
        tags: [],
      });
    });

    result.current.allVisibleProjects.forEach((p) => {
      expect(p.stage).toBe("idea");
    });
  });

  it("busqueda por texto filtra por titulo", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));

    act(() => {
      result.current.setSearchQuery("tutorías");
    });

    await waitFor(() => {
      const visible = result.current.allVisibleProjects;
      expect(visible.length).toBeGreaterThan(0);
      visible.forEach((p) => expect(p.title.toLowerCase()).toContain("tutorías"));
    });
  });

  it("clearFilters limpia busqueda y todos los grupos", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));

    act(() => {
      result.current.applyFilters({
        skills: [AppCatalogs.skillData],
        programs: [AppCatalogs.programSystems],
        stages: ["idea"],
        tags: [AppCatalogs.tagEducation],
      });
      result.current.setSearchQuery("algo");
    });

    act(() => result.current.clearFilters());

    expect(result.current.skillFilters).toEqual([]);
    expect(result.current.programFilters).toEqual([]);
    expect(result.current.stageFilters).toEqual([]);
    expect(result.current.tagFilters).toEqual([]);
    expect(result.current.searchQuery).toBe("");
  });

  it("activeFilterCount cuenta grupos, no chips individuales", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));

    act(() => {
      result.current.applyFilters({
        skills: [AppCatalogs.skillData, AppCatalogs.skillUx],
        programs: [AppCatalogs.programSystems],
        stages: [],
        tags: [],
      });
    });

    // Dos habilidades + un programa = 2 grupos marcados.
    expect(result.current.activeFilterCount).toBe(2);
  });

  it("filtros entre grupos se cruzan (AND), dentro del grupo se suman (OR)", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));

    act(() => {
      result.current.applyFilters({
        skills: [AppCatalogs.skillData],
        programs: [AppCatalogs.programSystems],
        stages: [],
        tags: [],
      });
    });

    // Debe pedir la habilidad Y ser del programa.
    result.current.allVisibleProjects.forEach((p) => {
      expect(p.skillsWanted.includes(AppCatalogs.skillData)).toBe(true);
      expect(p.academicProgram).toBe(AppCatalogs.programSystems);
    });
  });

  it("applyFilters reemplaza la seleccion anterior por completo", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects.length).toBeGreaterThan(0));

    act(() => {
      result.current.applyFilters({
        skills: [AppCatalogs.skillData],
        programs: [],
        stages: [],
        tags: [],
      });
    });
    act(() => {
      result.current.applyFilters({
        skills: [AppCatalogs.skillUx],
        programs: [],
        stages: [],
        tags: [],
      });
    });

    // Solo debe quedar la segunda seleccion.
    expect(result.current.skillFilters).toEqual([AppCatalogs.skillUx]);
  });
});
