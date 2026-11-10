import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { Follow } from "@/src/features/follow/domain/entities/Follow";
import { FollowRepository } from "@/src/features/follow/domain/repositories/FollowRepository";

// Reemplaza a `FollowController` de Flutter: los proyectos que sigue el
// estudiante de la sesion, compartidos por el boton "Seguir" del detalle y la
// pestana "Siguiendo" de Mis proyectos. Se vuelve a cargar cuando cambia la
// sesion.
//
// Lo completa el carril 1. Envuelto en `App.tsx`.
export type FollowsValue = {
  follows: Follow[];
  isLoading: boolean;
  isFollowing: (projectId: string) => boolean;
  toggleFollow: (projectId: string, active: boolean) => Promise<void>;
  reload: () => Promise<void>;
};

const FollowsContext = createContext<FollowsValue | undefined>(undefined);

export function FollowsProvider({ children }: { children: React.ReactNode }) {
  const repo = useInject<FollowRepository>(TOKENS.FollowRepo);
  const { user } = useSession();

  const [follows, setFollows] = useState<Follow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFollows = useCallback(async () => {
    if (!user?.userId) {
      setFollows([]);
      return;
    }
    setIsLoading(true);
    try {
      const loaded = await repo.getFollowsByUser(user.userId);
      setFollows(loaded);
    } catch {
      // Sin red o sin sesion la lista queda vacia; no reventa la app.
    } finally {
      setIsLoading(false);
    }
  }, [repo, user]);

  // Recarga cada vez que cambia el usuario (login/logout), igual que
  // `_sessionSub` en `FollowController` de Flutter.
  useEffect(() => {
    if (user) {
      loadFollows();
    } else {
      setFollows([]);
    }
  }, [user, loadFollows]);

  const isFollowing = useCallback(
    (projectId: string) => follows.some((f) => f.projectId === projectId),
    [follows],
  );

  // Sigue o deja de seguir un proyecto. Actualiza la lista local sin esperar
  // a recargar desde el servidor, como en Flutter.
  const toggleFollow = useCallback(
    async (projectId: string, active: boolean) => {
      if (!user?.userId) return;
      try {
        const result = await repo.toggleFollow(user.userId, projectId, active);
        setFollows((prev) => {
          const index = prev.findIndex((f) => f.projectId === projectId);
          if (active) {
            return index === -1 ? [...prev, result] : prev;
          } else {
            return index !== -1 ? prev.filter((f) => f.projectId !== projectId) : prev;
          }
        });
      } catch {
        // Error silencioso: el icono no cambia; el usuario puede reintentar.
      }
    },
    [repo, user],
  );

  const value = useMemo<FollowsValue>(
    () => ({
      follows,
      isLoading,
      isFollowing,
      toggleFollow,
      reload: loadFollows,
    }),
    [follows, isLoading, isFollowing, toggleFollow, loadFollows],
  );

  return <FollowsContext.Provider value={value}>{children}</FollowsContext.Provider>;
}

export function useFollows(): FollowsValue {
  const ctx = useContext(FollowsContext);
  if (!ctx) throw new Error("FollowsProvider no encontrado");
  return ctx;
}
