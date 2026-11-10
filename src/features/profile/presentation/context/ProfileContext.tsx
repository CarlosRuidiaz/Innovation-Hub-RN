import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { Profile } from "../../domain/entities/Profile";
import { ProfileRepository } from "../../domain/repositories/ProfileRepository";

export type ProfileViewModel = {
  // El perfil de quien tiene la sesion, o `null` sin sesion o mientras carga.
  profile: Profile | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileViewModel | undefined>(undefined);

// Lo ultimo que se cargo, y para quien.
type Loaded = { userId: string; profile: Profile | null };

// El perfil de la sesion, compartido por toda la app: el `ProfileController`
// de Flutter. Su `id` es el `userId` de la sesion.
//
// El perfil es de quien tenga la sesion: si entra otra cuenta se vuelve a
// pedir, y al cerrar sesion se limpia (`sessionChanges` en Flutter). Un perfil
// cargado para otra cuenta no se muestra nunca.
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const repository = useInject<ProfileRepository>(TOKENS.ProfileRepo);
  const { user } = useSession();
  const userId = user?.userId ?? null;

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Solo vale la ultima peticion: si la sesion cambia a mitad de camino, la
  // respuesta vieja no pisa el perfil nuevo.
  const requestRef = useRef(0);

  const load = useCallback(
    async (forUser: string) => {
      const request = ++requestRef.current;
      let profile: Profile | null;
      try {
        profile = await repository.getCurrentProfile();
      } catch {
        // Sin sesion no hay perfil, y eso no es un fallo que deba reventar una
        // pantalla: se deja vacio y quien lo pinte decide que mostrar.
        profile = null;
      }
      if (request === requestRef.current) setLoaded({ userId: forUser, profile });
    },
    [repository],
  );

  useEffect(() => {
    if (userId != null) load(userId);
  }, [userId, load]);

  const refresh = useCallback(async () => {
    if (userId == null) return;
    setRefreshing(true);
    try {
      await load(userId);
    } finally {
      setRefreshing(false);
    }
  }, [userId, load]);

  const current = userId != null && loaded?.userId === userId ? loaded : null;
  const isLoading = (userId != null && current == null) || refreshing;

  const value = useMemo<ProfileViewModel>(
    () => ({ profile: current?.profile ?? null, isLoading, refresh }),
    [current, isLoading, refresh],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
