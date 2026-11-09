import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `create_poll_page.dart`. La migra su carril.
// Recibe el proyecto (`project`) por los parametros de la ruta `CreatePoll`,
// como el `Get.arguments` de Flutter.
export default function CreatePollScreen() {
  return <PendingScreen name="CreatePollScreen" replaces="create_poll_page.dart" />;
}
