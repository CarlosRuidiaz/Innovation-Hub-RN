import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `publish_update_page.dart`. La migra su carril.
// Recibe el proyecto (`project`) por los parametros de la ruta `PublishUpdate`,
// como el `Get.arguments` de Flutter.
export default function PublishUpdateScreen() {
  return <PendingScreen name="PublishUpdateScreen" replaces="publish_update_page.dart" />;
}
