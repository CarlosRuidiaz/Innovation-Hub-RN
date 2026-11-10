import { useCallback, useEffect, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { Application } from "../../domain/entities/Application";
import { ApplicationRepository } from "../../domain/repositories/ApplicationRepository";

export type MyApplication = {
  // La postulacion viva del estudiante en ese proyecto, o `null`.
  application: Application | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const LIVE_STATUSES = ["pending", "accepted", "removed"];

// Reemplaza `vigenteEn` y `fueRemovidoDe` de `ApplicationController`, que el
// detalle del proyecto usa para saber si el estudiante es miembro (y si puede
// ver el espacio de trabajo).
//
// Lo completa el carril 2: pedir al repositorio las postulaciones del
// estudiante de la sesion y devolver la de `projectId`.
export function useMyApplication(projectId: string): MyApplication {
  const repository = useInject<ApplicationRepository>(TOKENS.ApplicationRepo);
  const { user } = useSession();
  const userId = user?.userId ?? null;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setApplication(null);
      return;
    }
    setLoading(true);
    try {
      const apps = await repository.getMyApplications(userId);
      const found = apps.find(
        (a) => a.projectId === projectId && LIVE_STATUSES.includes(a.status),
      );
      setApplication(found ?? null);
    } catch {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, [repository, userId, projectId]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      Promise.resolve().then(() => {
        if (active) setApplication(null);
      });
      return;
    }
    repository.getMyApplications(userId).then(
      (apps) => {
        if (active) {
          const found = apps.find(
            (a) => a.projectId === projectId && LIVE_STATUSES.includes(a.status),
          );
          setApplication(found ?? null);
        }
      },
      () => {
        if (active) {
          setApplication(null);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [repository, userId, projectId]);

  return { application, loading, refresh };
}
