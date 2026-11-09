import React from "react";

// Reemplaza a `ProjectController` de Flutter: la lista de proyectos y los
// filtros (busqueda, habilidades, programas, etapas y tags), que comparten la
// cartelera y la pantalla de filtros. Filtrar y ordenar es trabajo suyo, no de
// la lista.
//
// Lo completa el carril 1. Ya esta envuelto en `App.tsx`.
//
// Por ahora el proveedor solo devuelve a sus hijos.
export type ProjectsValue = Record<string, never>;

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useProjects(): ProjectsValue {
  return {};
}
