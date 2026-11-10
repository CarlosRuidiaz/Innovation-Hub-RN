import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

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
  // Recarga los seguidos y los conteos de seguidores.
  reload: () => Promise<void>;
  // Kora: cuantas personas siguen un proyecto, para las tarjetas.
  followersOf: (projectId: string | null) => number;
};

const FollowsContext = createContext<FollowsValue | undefined>(undefined);

export function FollowsProvider({ children }: { children: React.ReactNode }) {
  const repo = useInject<FollowRepository>(TOKENS.FollowRepo);
  const { user } = useSession();
  const userId = user?.userId ?? null;

  // Los seguidos y de quien son: los de otra cuenta no se muestran nunca.
  const [loaded, setLoaded] = useState<{ userId: string; follows: Follow[] } | null>(null);
  const [reloading, setReloading] = useState(false);
  const follows = useMemo(
    () => (userId != null && loaded?.userId === userId ? loaded.follows : []),
    [loaded, userId],
  );

  const [failedFor, setFailedFor] = useState<string | null>(null);
  const isLoading = reloading || (userId != null && loaded?.userId !== userId && failedFor !== userId);

  // Kora: los seguidores de cada proyecto. Se cargan al abrir la app (al entrar
  // una cuenta), con `reload`, y se ajustan al seguir o dejar de seguir.
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Solo vale la ultima peticion: una respuesta vieja no pisa la nueva.
  const requestRef = useRef(0);
  const countsRequestRef = useRef(0);

  const fetchCounts = useCallback(async () => {
    const request = ++countsRequestRef.current;
    try {
      const result = await repo.countFollowers();
      if (request === countsRequestRef.current) setCounts(result);
    } catch {
      // Sin conteos, las tarjetas muestran los que habia.
    }
  }, [repo]);
  const fetchFollows = useCallback(
    async (forUser: string) => {
      const request = ++requestRef.current;
      let result: Follow[] | null;
      try {
        result = await repo.getFollowsByUser(forUser);
      } catch {
        // Sin red la lista queda vacia; no revienta la app.
        result = null;
      }
      if (request === requestRef.current) {
        if (result) setLoaded({ userId: forUser, follows: result });
        else setFailedFor(forUser);
      }
    },
    [repo],
  );

  // Recarga cada vez que entra otra cuenta, igual que `_sessionSub` en
  // `FollowController` de Flutter. Al salir, `follows` queda vacia sola.
  useEffect(() => {
    if (!userId) return;
    const request = ++requestRef.current;
    repo.getFollowsByUser(userId).then(
      (result) => {
        if (request === requestRef.current) setLoaded({ userId, follows: result });
      },
      () => {
        if (request === requestRef.current) setFailedFor(userId);
      },
    );
    // Dentro de la promesa: si falla, aunque sea al llamarla, la app sigue.
    const countsRequest = ++countsRequestRef.current;
    Promise.resolve()
      .then(() => repo.countFollowers())
      .then(
        (result) => {
          if (countsRequest === countsRequestRef.current) setCounts(result);
        },
        () => {},
      );
  }, [userId, repo]);

  const loadFollows = useCallback(async () => {
    if (!userId) return;
    setReloading(true);
    try {
      await Promise.all([fetchFollows(userId), fetchCounts()]);
    } finally {
      setReloading(false);
    }
  }, [fetchFollows, fetchCounts, userId]);

  const isFollowing = useCallback(
    (projectId: string) => follows.some((f) => f.projectId === projectId),
    [follows],
  );

  // Sigue o deja de seguir un proyecto. Actualiza la lista local sin esperar
  // a recargar desde el servidor, como en Flutter.
  const toggleFollow = useCallback(
    async (projectId: string, active: boolean) => {
      if (!userId) return;
      try {
        const was = follows.some((f) => f.projectId === projectId);
        const result = await repo.toggleFollow(userId, projectId, active);
        // El conteo sube o baja solo si de verdad cambio.
        if (was !== active) {
          setCounts((prev) => ({ ...prev, [projectId]: Math.max(0, (prev[projectId] ?? 0) + (active ? 1 : -1)) }));
        }
        setLoaded((prev) => {
          const current = prev?.userId === userId ? prev.follows : [];
          const index = current.findIndex((f) => f.projectId === projectId);
          if (active) {
            return { userId, follows: index === -1 ? [...current, result] : current };
          }
          return { userId, follows: current.filter((f) => f.projectId !== projectId) };
        });
      } catch {
        // Error silencioso: el icono no cambia; el usuario puede reintentar.
      }
    },
    [repo, userId, follows],
  );

  const followersOf = useCallback((projectId: string | null) => (projectId ? (counts[projectId] ?? 0) : 0), [counts]);

  const value = useMemo<FollowsValue>(
    () => ({
      follows,
      isLoading,
      isFollowing,
      toggleFollow,
      reload: loadFollows,
      followersOf,
    }),
    [follows, isLoading, isFollowing, toggleFollow, loadFollows, followersOf],
  );

  return <FollowsContext.Provider value={value}>{children}</FollowsContext.Provider>;
}

export function useFollows(): FollowsValue {
  const ctx = useContext(FollowsContext);
  if (!ctx) throw new Error("FollowsProvider no encontrado");
  return ctx;
}
