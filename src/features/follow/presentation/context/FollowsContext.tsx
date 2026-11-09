import React from "react";

// Reemplaza a `FollowController` de Flutter: los proyectos que sigue el
// estudiante de la sesion, compartidos por el boton "Seguir" del detalle y la
// pestaña "Siguiendo" de Mis proyectos. Se vuelve a cargar cuando cambia la
// sesion.
//
// Lo completa el carril 1. Ya esta envuelto en `App.tsx`.
//
// Por ahora el proveedor solo devuelve a sus hijos.
export type FollowsValue = Record<string, never>;

export function FollowsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useFollows(): FollowsValue {
  return {};
}
