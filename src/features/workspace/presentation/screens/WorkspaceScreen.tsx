import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `workspace_page.dart`. La migra su carril.
// Recibe el proyecto (`project`) por los parametros de la ruta `Workspace`,
// como el `Get.arguments` de Flutter.
export default function WorkspaceScreen() {
  return <PendingScreen name="WorkspaceScreen" replaces="workspace_page.dart" />;
}
