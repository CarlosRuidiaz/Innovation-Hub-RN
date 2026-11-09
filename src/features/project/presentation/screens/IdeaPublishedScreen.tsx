import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `idea_published_page.dart`. La migra su carril.
// Recibe el proyecto recien creado (`project`) por los parametros de la ruta `IdeaPublished`,
// como el `Get.arguments` de Flutter.
export default function IdeaPublishedScreen() {
  return <PendingScreen name="IdeaPublishedScreen" replaces="idea_published_page.dart" />;
}
