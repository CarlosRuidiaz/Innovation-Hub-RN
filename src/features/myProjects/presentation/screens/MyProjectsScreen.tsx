import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `my_projects_view.dart`. La migra su carril.
export default function MyProjectsScreen() {
  return <PendingScreen name="MyProjectsScreen" testID={MyProjectsScreen.key} replaces="my_projects_view.dart" />;
}

// La `Key` de la pagina en Flutter. Las pruebas de la base la buscan: al
// reemplazar esta pantalla, se conserva con este mismo nombre.
MyProjectsScreen.key = "MyProjectsView";
