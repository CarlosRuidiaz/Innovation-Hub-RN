import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { useProfile } from "@/src/features/profile/presentation/context/ProfileContext";
import { Project, matchesAnySkill } from "@/src/features/project/domain/entities/Project";
import { ProjectStage } from "@/src/features/project/domain/entities/ProjectStage";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";

// Reemplaza a `ProjectController` de Flutter: la lista de proyectos y los
// filtros (busqueda, habilidades, programas, etapas y tags), que comparten la
// cartelera y la pantalla de filtros. Filtrar y ordenar es trabajo suyo, no de
// la lista.
//
// Lo completa el carril 1. Envuelto en `App.tsx`.
export type ProjectsValue = {
  // La lista completa que devolvio el repositorio.
  projects: Project[];
  isLoading: boolean;
  // Habilidades del perfil en sesion, para "Para tus habilidades".
  mySkills: string[];
  // Filtros: busqueda y cuatro grupos de seleccion multiple.
  searchQuery: string;
  skillFilters: string[];
  programFilters: string[];
  stageFilters: ProjectStage[];
  tagFilters: string[];
  // Cuantos GRUPOS tienen algo marcado (el numero del boton "Filtros").
  activeFilterCount: number;
  // Si hay algun filtro puesto, contando la busqueda.
  hasActiveFilters: boolean;
  // Los proyectos de la pestana "Para tus habilidades".
  projectsForMySkills: Project[];
  // Los de la pestana "Explorar", recortados por la busqueda y los filtros.
  allVisibleProjects: Project[];
  // Acciones.
  refresh: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  applyFilters: (opts: {
    skills: string[];
    programs: string[];
    stages: ProjectStage[];
    tags: string[];
  }) => void;
  clearFilters: () => void;
  // Llama al repositorio y recarga la lista (para despues de crear un proyecto).
  createProject: (project: Project) => Promise<Project>;
};

const ProjectsContext = createContext<ProjectsValue | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const repo = useInject<ProjectRepository>(TOKENS.ProjectRepo);
  const { user } = useSession();
  const userId = user?.userId ?? null;
  const { profile } = useProfile();

  const [projects, setProjects] = useState<Project[]>([]);
  // Para que cuenta se cargo la lista por ultima vez (`undefined`: todavia no).
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const isLoading = refreshing || loadedFor !== userId;
  // Las habilidades del perfil en sesion, como `mySkills` de `ProjectController`.
  // Salen de `ProfileContext`: el usuario de la sesion no trae el `extra`.
  const mySkills: string[] = useMemo(() => profile?.skills ?? [], [profile]);

  const [searchQuery, setSearchQueryState] = useState("");
  const [skillFilters, setSkillFilters] = useState<string[]>([]);
  const [programFilters, setProgramFilters] = useState<string[]>([]);
  const [stageFilters, setStageFilters] = useState<ProjectStage[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  // Solo vale la ultima peticion: una respuesta vieja no pisa la nueva.
  const requestRef = useRef(0);
  const fetchProjects = useCallback(
    async (forUser: string | null) => {
      const request = ++requestRef.current;
      let loaded: Project[] | null;
      try {
        loaded = await repo.getProjects();
      } catch {
        // Como en Flutter, un fallo deja la lista que ya habia.
        loaded = null;
      }
      if (request === requestRef.current) {
        if (loaded) setProjects(loaded);
        setLoadedFor(forUser);
      }
    },
    [repo],
  );

  // Al cambiar de cuenta se recarga la lista, igual que `_sesion` en Flutter.
  useEffect(() => {
    const request = ++requestRef.current;
    repo.getProjects().then(
      (loaded) => {
        if (request !== requestRef.current) return;
        setProjects(loaded);
        setLoadedFor(userId);
      },
      () => {
        if (request === requestRef.current) setLoadedFor(userId);
      },
    );
  }, [userId, repo]);

  // `getProjects` de Flutter: deslizar para refrescar, y despues de crear.
  const loadProjects = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProjects(userId);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProjects, userId]);

  // Al cerrar sesion se limpian los filtros. Se hace durante el render al ver
  // que cambio la cuenta, el patron de React para derivar estado de una prop.
  const [lastUserId, setLastUserId] = useState(userId);
  if (lastUserId !== userId) {
    setLastUserId(userId);
    if (userId == null) {
      setSkillFilters([]);
      setProgramFilters([]);
      setStageFilters([]);
      setTagFilters([]);
      setSearchQueryState("");
    }
  }

  // --- Listas derivadas (calculadas, no almacenadas) ---

  // Pestana "Para tus habilidades": los proyectos que piden alguna habilidad
  // del perfil. Parte de la lista completa, no de visibleProjects.
  const projectsForMySkills = useMemo(
    () => projects.filter((p) => matchesAnySkill(p, mySkills)),
    [projects, mySkills],
  );

  // Pestana "Explorar": todos, recortados por busqueda y filtros.
  const allVisibleProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      if (stageFilters.length > 0 && !stageFilters.includes(p.stage)) return false;
      if (programFilters.length > 0 && !programFilters.includes(p.academicProgram)) return false;
      if (skillFilters.length > 0 && !matchesAnySkill(p, skillFilters)) return false;
      if (tagFilters.length > 0 && !p.tags.some((t) => tagFilters.includes(t))) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projects, searchQuery, skillFilters, programFilters, stageFilters, tagFilters]);

  // Cuantos grupos tienen algo marcado (la busqueda no cuenta).
  const activeFilterCount = useMemo(
    () =>
      (skillFilters.length > 0 ? 1 : 0) +
      (programFilters.length > 0 ? 1 : 0) +
      (stageFilters.length > 0 ? 1 : 0) +
      (tagFilters.length > 0 ? 1 : 0),
    [skillFilters, programFilters, stageFilters, tagFilters],
  );

  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim().length > 0;

  const setSearchQuery = useCallback((q: string) => setSearchQueryState(q), []);

  // Vuelca de golpe lo que la pantalla de filtros traia. Solo se aplica al
  // pulsar "Aplicar": salir con atras deja los filtros como estaban.
  const applyFilters = useCallback(
    (opts: { skills: string[]; programs: string[]; stages: ProjectStage[]; tags: string[] }) => {
      setSkillFilters([...opts.skills]);
      setProgramFilters([...opts.programs]);
      setStageFilters([...opts.stages]);
      setTagFilters([...opts.tags]);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setSkillFilters([]);
    setProgramFilters([]);
    setStageFilters([]);
    setTagFilters([]);
    setSearchQueryState("");
  }, []);

  // Crear un proyecto y volver a cargar la lista para que la cartelera lo vea.
  const createProject = useCallback(
    async (project: Project): Promise<Project> => {
      const created = await repo.createProject(project);
      await loadProjects();
      return created;
    },
    [repo, loadProjects],
  );

  const value = useMemo<ProjectsValue>(
    () => ({
      projects,
      isLoading,
      mySkills,
      searchQuery,
      skillFilters,
      programFilters,
      stageFilters,
      tagFilters,
      activeFilterCount,
      hasActiveFilters,
      projectsForMySkills,
      allVisibleProjects,
      refresh: loadProjects,
      setSearchQuery,
      applyFilters,
      clearFilters,
      createProject,
    }),
    [
      projects,
      isLoading,
      mySkills,
      searchQuery,
      skillFilters,
      programFilters,
      stageFilters,
      tagFilters,
      activeFilterCount,
      hasActiveFilters,
      projectsForMySkills,
      allVisibleProjects,
      loadProjects,
      setSearchQuery,
      applyFilters,
      clearFilters,
      createProject,
    ],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsValue {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("ProjectsProvider no encontrado");
  return ctx;
}
