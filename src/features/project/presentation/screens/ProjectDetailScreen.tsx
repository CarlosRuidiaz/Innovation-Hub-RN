import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `project_detail_page.dart`. La migra su carril.
// Recibe el proyecto (`project`) por los parametros de la ruta `ProjectDetail`,
// como el `Get.arguments` de Flutter.
export default function ProjectDetailScreen() {
  return <PendingScreen name="ProjectDetailScreen" testID={ProjectDetailScreen.key} replaces="project_detail_page.dart" />;
}

// La `Key` de la pagina en Flutter. Las pruebas de la base la buscan: al
// reemplazar esta pantalla, se conserva con este mismo nombre.
ProjectDetailScreen.key = "ProjectDetailPage";
