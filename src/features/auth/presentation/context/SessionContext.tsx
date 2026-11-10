import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useInject } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { errorMessage } from "@/src/core/roble/errorMessage";
import { AuthFailure } from "../../domain/AuthFailure";
import { AppUser, INSTITUTIONAL_DOMAIN, isInstitutionalEmail } from "../../domain/entities/AppUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

// El perfil que pide el paso 2 del registro.
export type SignUpProfile = {
  name: string;
  academicProgram: string;
  semester: number;
  skills: string[];
  bio?: string | null;
};

export type SessionViewModel = {
  // `false` mientras se recupera la sesion guardada (el splash sigue visible).
  ready: boolean;
  user: AppUser | null;
  isLogged: boolean;
  isLoading: boolean;
  // Vacio mientras la ultima peticion salio bien, como `error` en Flutter.
  error: string;
  // El error de ahora mismo, no el del ultimo render: la pantalla lo lee justo
  // despues de un `login` que fallo, para el aviso.
  lastError: () => string;
  clearError: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, profile: SignUpProfile) => Promise<boolean>;
  logout: () => Promise<boolean>;
  currentUser: () => AppUser | null;
};

const INVALID_CREDENTIALS = "Escribe un correo valido y una contrasena de mas de 6 caracteres.";
const NOT_INSTITUTIONAL = `Usa tu correo institucional ${INSTITUTIONAL_DOMAIN}.`;

const SessionContext = createContext<SessionViewModel | undefined>(undefined);

// Quien esta dentro: el `AuthenticationController` de Flutter, con la forma
// del `SessionContext` de r_market. Vive toda la vida de la app y decide, con
// `isLogged`, si se ve el login o la app (`central.dart`).
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const auth = useInject<AuthRepository>(TOKENS.AuthRepo);
  const snackbar = useSnackbar();

  const [ready, setReady] = useState(false);
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setErrorState] = useState("");

  // Las acciones leen de aqui y no del estado: asi no se quedan con un valor
  // viejo entre renders.
  const userRef = useRef<AppUser | null>(null);
  const errorRef = useRef("");
  const setUser = useCallback((u: AppUser | null) => {
    userRef.current = u;
    setUserState(u);
  }, []);
  const setError = useCallback((message: string) => {
    errorRef.current = message;
    setErrorState(message);
  }, []);

  useEffect(() => {
    let active = true;
    // Quien ya entro una vez no vuelve a ver el login. Si restaurar falla, se
    // arranca sin sesion.
    auth
      .restoreSession()
      .catch(() => null)
      .then((restored) => {
        if (!active) return;
        // Si alguien entro mientras se recuperaba la sesion, gana lo nuevo.
        if (!userRef.current) setUser(restored);
        setReady(true);
      });
    // Caducar y cerrar sesion dejan los dos sin sesion, pero solo uno merece
    // explicacion: el paquete no avisa aqui en `logout()`.
    const stop = auth.onSessionExpired(() => {
      if (!userRef.current) return;
      setUser(null);
      snackbar("Tu sesion expiro. Vuelve a entrar.");
    });
    return () => {
      active = false;
      stop();
    };
  }, [auth, setUser, snackbar]);

  // La validacion de Flutter, antes de salir a la red: el correo no vacio, la
  // contraseña de mas de 6 y el dominio de la universidad.
  const invalid = useCallback((email: string, password: string): string | null => {
    if (!email || password.length <= 6) return INVALID_CREDENTIALS;
    if (!isInstitutionalEmail(email)) return NOT_INSTITUTIONAL;
    return null;
  }, []);

  const run = useCallback(
    async (action: () => Promise<AppUser>): Promise<boolean> => {
      setLoading(true);
      try {
        setUser(await action());
        return true;
      } catch (e) {
        setError(e instanceof AuthFailure ? e.message : errorMessage(e));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setError, setUser],
  );

  const login = useCallback(
    (email: string, password: string) => {
      setError("");
      const problem = invalid(email, password);
      if (problem) {
        setError(problem);
        return Promise.resolve(false);
      }
      return run(() => auth.login(email, password));
    },
    [auth, invalid, run, setError],
  );

  // `register` con `autoLogin` deja la sesion abierta: la app ya puede entrar
  // sin pasar por el login.
  const signUp = useCallback(
    (email: string, password: string, profile: SignUpProfile) => {
      setError("");
      const problem = invalid(email, password);
      if (problem) {
        setError(problem);
        return Promise.resolve(false);
      }
      const name = profile.name.trim();
      return run(() =>
        auth.signUp({
          email,
          password,
          name: name ? name : email,
          academicProgram: profile.academicProgram,
          semester: profile.semester,
          skills: profile.skills,
          bio: profile.bio,
        }),
      );
    },
    [auth, invalid, run, setError],
  );

  // Una peticion que falla no deja a nadie en una sesion en la que ya no se
  // puede confiar: se sale igual.
  const logout = useCallback(async () => {
    setError("");
    try {
      await auth.logout();
      return true;
    } catch (e) {
      setError(e instanceof AuthFailure ? e.message : errorMessage(e));
      return false;
    } finally {
      setUser(null);
    }
  }, [auth, setError, setUser]);

  // Estable: las pantallas la llaman en un efecto al montarse.
  const clearError = useCallback(() => setError(""), [setError]);

  const value = useMemo<SessionViewModel>(
    () => ({
      ready,
      user,
      isLogged: user != null,
      isLoading,
      error,
      lastError: () => errorRef.current,
      clearError,
      login,
      signUp,
      logout,
      currentUser: () => userRef.current,
    }),
    [ready, user, isLoading, error, clearError, login, signUp, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
