import { useCallback, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Application, ApplicationStatus, isPending } from "@/src/features/application/domain/entities/Application";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { Project } from "@/src/features/project/domain/entities/Project";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";

export type ManagementViewModel = {
  applicants: Application[];
  project: Project | null;
  isLoading: boolean;
  pendingCount: number;
  getApplicants: (projectId: string) => Promise<void>;
  decide: (applicationId: string, decision: ApplicationStatus) => Promise<void>;
  closeRecruitment: (projectId: string) => Promise<void>;
};

// Hook que replica el comportamiento de `ManagementController` en Flutter.
export function useManagementViewModel(): ManagementViewModel {
  const applicationRepo = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);
  const projectRepo = useInject<ProjectRepository>(TOKENS.ProjectRepo);

  const [applicants, setApplicants] = useState<Application[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pendingCount = applicants.filter(isPending).length;

  const getApplicants = useCallback(
    async (projectId: string) => {
      setProject((curr) => {
        if (curr?.id !== projectId) {
          setApplicants([]);
          return null;
        }
        return curr;
      });

      setIsLoading(true);
      try {
        const [apps, projects] = await Promise.all([
          applicationRepo.getApplicationsFor(projectId),
          projectRepo.getProjects(),
        ]);
        setApplicants(apps);
        setProject(projects.find((p) => p.id === projectId) ?? null);
      } finally {
        setIsLoading(false);
      }
    },
    [applicationRepo, projectRepo],
  );

  const decide = useCallback(
    async (applicationId: string, decision: ApplicationStatus) => {
      await applicationRepo.decide(applicationId, decision);
      if (project?.id) {
        if (decision === "accepted") {
          await projectRepo.addMember(project.id);
        }
        await getApplicants(project.id);
      }
    },
    [applicationRepo, projectRepo, project?.id, getApplicants],
  );

  const closeRecruitment = useCallback(
    async (projectId: string) => {
      await projectRepo.closeRecruitment(projectId);
      await getApplicants(projectId);
    },
    [projectRepo, getApplicants],
  );

  return {
    applicants,
    project,
    isLoading,
    pendingCount,
    getApplicants,
    decide,
    closeRecruitment,
  };
}
