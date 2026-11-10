import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `respond_poll_page.dart`. La migra su carril.
// Recibe la encuesta (`poll`) por los parametros de la ruta `RespondPoll`,
// como el `Get.arguments` de Flutter.
export default function RespondPollScreen() {
  return <PendingScreen name="RespondPollScreen" replaces="respond_poll_page.dart" />;
}
