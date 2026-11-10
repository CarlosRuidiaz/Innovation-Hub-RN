import { useCallback, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Project } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import { Application, isPending } from "../../domain/entities/Application";
import { ApplicationRepository } from "../../domain/repositories/ApplicationRepository";

export type ApplicationViewModel = {
  myApplications: Application[];
  isLoading: boolean;
  vigenteEn: (projectId: string) => Application | null;
  fueRemovidoDe: (projectId: string) => boolean;
  getMyApplications: (applicantId: string) => Promise<void>;
  apply: (application: Application) => Promise<Application | null>;
  withdraw: (applicationId: string, applicantId?: string) => Promise<void>;
  getProject: (projectId: string) => Promise<Project | null>;
};

// Hook que replica el comportamiento de `ApplicationController` en Flutter.
export function useApplicationViewModel(): ApplicationViewModel {
  const repository = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);
  const projectRepository = useInject<ProjectRepository>(TOKENS.ProjectRepo);

  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const vigenteEn = useCallback(
    (projectId: string): Application | null => {
      return (
        myApplications.find(
          (a) => a.projectId === projectId && (a.status === "pending" || a.status === "accepted"),
        ) ?? null
      );
    },
    [myApplications],
  );

  const fueRemovidoDe = useCallback(
    (projectId: string): boolean => {
      return myApplications.some((a) => a.projectId === projectId && a.status === "removed");
    },
    [myApplications],
  );

  const getMyApplications = useCallback(
    async (applicantId: string) => {
      setIsLoading(true);
      try {
        const apps = await repository.getMyApplications(applicantId);
        setMyApplications(apps);
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const getProject = useCallback(
    async (projectId: string): Promise<Project | null> => {
      try {
        const projects = await projectRepository.getProjects();
        return projects.find((p) => p.id === projectId) ?? null;
      } catch {
        return null;
      }
    },
    [projectRepository],
  );

  const apply = useCallback(
    async (application: Application): Promise<Application | null> => {
      const project = await getProject(application.projectId);
      if (project && project.leaderId === application.applicantId) {
        return null;
      }

      setIsLoading(true);
      try {
        const created = await repository.apply(application);
        const apps = await repository.getMyApplications(application.applicantId);
        setMyApplications(apps);
        return created;
      } finally {
        setIsLoading(false);
      }
    },
    [repository, getProject],
  );

  const withdraw = useCallback(
    async (applicationId: string, applicantId?: string) => {
      setIsLoading(true);
      try {
        const existing = myApplications.find((a) => a.id === applicationId);
        const targetApplicantId = applicantId ?? existing?.applicantId;
        await repository.withdraw(applicationId);
        if (targetApplicantId) {
          const apps = await repository.getMyApplications(targetApplicantId);
          setMyApplications(apps);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [repository, myApplications],
  );

  return {
    myApplications,
    isLoading,
    vigenteEn,
    fueRemovidoDe,
    getMyApplications,
    apply,
    withdraw,
    getProject,
  };
}
