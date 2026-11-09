import { useCallback } from "react";

import { Application } from "../../domain/entities/Application";

export type MyApplication = {
  // La postulacion viva del estudiante en ese proyecto, o `null`.
  application: Application | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

// Reemplaza `vigenteEn` y `fueRemovidoDe` de `ApplicationController`, que el
// detalle del proyecto usa para saber si el estudiante es miembro (y si puede
// ver el espacio de trabajo).
//
// Lo completa el carril 2: pedir al repositorio las postulaciones del
// estudiante de la sesion y devolver la de `projectId`.
//
// Por ahora devuelve `application: null`.
export function useMyApplication(projectId: string): MyApplication {
  const refresh = useCallback(async () => {}, []);
  return { application: null, loading: false, refresh };
}
