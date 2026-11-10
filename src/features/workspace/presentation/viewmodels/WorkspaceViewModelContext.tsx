import React, { createContext, useContext } from "react";

import { WorkspaceViewModel } from "./useWorkspaceViewModel";

const WorkspaceViewModelContext = createContext<WorkspaceViewModel | null>(null);

// Las pestañas y las hojas del espacio de trabajo leen el view model de la
// pantalla que las contiene, como el `Get.find<WorkspaceController>()` que
// hacian en Flutter. Lo pone `WorkspaceScreen`.
export function WorkspaceViewModelProvider({ value, children }: { value: WorkspaceViewModel; children: React.ReactNode }) {
  return <WorkspaceViewModelContext.Provider value={value}>{children}</WorkspaceViewModelContext.Provider>;
}

export function useWorkspace(): WorkspaceViewModel {
  const vm = useContext(WorkspaceViewModelContext);
  if (!vm) throw new Error("useWorkspace must be used inside WorkspaceViewModelProvider");
  return vm;
}
