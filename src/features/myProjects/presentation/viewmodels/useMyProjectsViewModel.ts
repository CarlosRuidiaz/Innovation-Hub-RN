import { useCallback, useEffect, useMemo, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, isPending } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { FollowRepository } from "@/src/features/follow/domain/repositories/FollowRepository";
import { useProfile } from "@/src/features/profile/presentation/context/ProfileContext";
import { Project } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";

export type MyProjectsViewModel = {
  isLoading: boolean;
  error: string;
  createdProjects: Project[];
  participatingProjects: Project[];
  followingProjects: Project[];
  myApplications: Application[];
  allProjects: Project[];
  activeProjectsCount: number;
  pendingFor: (projectId: string | null | undefined) => number;
  reload: () => Promise<void>;
};

export function useMyProjectsViewModel(): MyProjectsViewModel {
  const projectRepo = useInject<ProjectRepository>(TOKENS.ProjectRepo);
  const appRepo = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);
  const followRepo = useInject<FollowRepository>(TOKENS.FollowRepo);
  const { isLogged } = useSession();
  const { profile } = useProfile();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [participatingProjects, setParticipatingProjects] = useState<Project[]>([]);
  const [followingProjects, setFollowingProjects] = useState<Project[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  const myId = profile?.id ?? null;

  const pendingFor = useCallback(
    (projectId: string | null | undefined) => {
      if (!projectId) return 0;
      return pendingCounts[projectId] ?? 0;
    },
    [pendingCounts],
  );

  const activeProjectsCount = useMemo(() => {
    const ids = new Set<string>();
    for (const p of createdProjects) {
      if (p.stage !== "finished" && p.id != null) ids.add(p.id);
    }
    for (const p of participatingProjects) {
      if (p.stage !== "finished" && p.id != null) ids.add(p.id);
    }
    return ids.size;
  }, [createdProjects, participatingProjects]);

  const clearData = useCallback(() => {
    setCreatedProjects([]);
    setParticipatingProjects([]);
    setFollowingProjects([]);
    setMyApplications([]);
    setAllProjects([]);
    setPendingCounts({});
    setError("");
  }, []);

  const reload = useCallback(async () => {
    if (!isLogged || !myId) {
      clearData();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const projects = await projectRepo.getProjects();
      setAllProjects(projects);

      // Creados por mí
      const created = projects.filter((p) => p.leaderId === myId);
      setCreatedProjects(created);

      // Conteos de pendientes en paralelo
      const countsList = await Promise.all(
        created.map(async (p) => {
          if (!p.id) return { id: "", count: 0 };
          const apps = await appRepo.getApplicationsFor(p.id);
          return { id: p.id, count: apps.filter(isPending).length };
        }),
      );
      const countsMap: Record<string, number> = {};
      for (const item of countsList) {
        if (item.id) countsMap[item.id] = item.count;
      }
      setPendingCounts(countsMap);

      // Postulaciones del estudiante
      const myApps = await appRepo.getMyApplications(myId);
      setMyApplications(myApps);

      const acceptedProjectIds = new Set(
        myApps.filter((a) => a.status === "accepted").map((a) => a.projectId),
      );
      setParticipatingProjects(projects.filter((p) => p.id != null && acceptedProjectIds.has(p.id)));

      // Siguiendo
      const follows = await followRepo.getFollowsByUser(myId);
      const followedIds = new Set(follows.filter((f) => f.active).map((f) => f.projectId));
      setFollowingProjects(projects.filter((p) => p.id != null && followedIds.has(p.id)));
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLogged, myId, projectRepo, appRepo, followRepo, clearData]);

  useEffect(() => {
    let active = true;
    if (!isLogged || !myId) {
      Promise.resolve().then(() => {
        if (active) {
          setCreatedProjects([]);
          setParticipatingProjects([]);
          setFollowingProjects([]);
          setMyApplications([]);
          setAllProjects([]);
          setPendingCounts({});
          setError("");
        }
      });
      return;
    }

    const loadData = async () => {
      try {
        const projects = await projectRepo.getProjects();
        if (!active) return;
        setAllProjects(projects);

        const created = projects.filter((p) => p.leaderId === myId);
        setCreatedProjects(created);

        const countsList = await Promise.all(
          created.map(async (p) => {
            if (!p.id) return { id: "", count: 0 };
            const apps = await appRepo.getApplicationsFor(p.id);
            return { id: p.id, count: apps.filter(isPending).length };
          }),
        );
        if (!active) return;
        const countsMap: Record<string, number> = {};
        for (const item of countsList) {
          if (item.id) countsMap[item.id] = item.count;
        }
        setPendingCounts(countsMap);

        const myApps = await appRepo.getMyApplications(myId);
        if (!active) return;
        setMyApplications(myApps);

        const acceptedProjectIds = new Set(
          myApps.filter((a) => a.status === "accepted").map((a) => a.projectId),
        );
        setParticipatingProjects(projects.filter((p) => p.id != null && acceptedProjectIds.has(p.id)));

        const follows = await followRepo.getFollowsByUser(myId);
        if (!active) return;
        const followedIds = new Set(follows.filter((f) => f.active).map((f) => f.projectId));
        setFollowingProjects(projects.filter((p) => p.id != null && followedIds.has(p.id)));
      } catch (err) {
        if (active) setError(String(err));
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [isLogged, myId, projectRepo, appRepo, followRepo]);

  return {
    isLoading,
    error,
    createdProjects,
    participatingProjects,
    followingProjects,
    myApplications,
    allProjects,
    activeProjectsCount,
    pendingFor,
    reload,
  };
}

