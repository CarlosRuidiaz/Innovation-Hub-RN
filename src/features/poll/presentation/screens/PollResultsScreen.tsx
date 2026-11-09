import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `poll_results_page.dart`. La migra su carril.
// Recibe la encuesta (`poll`) por los parametros de la ruta `PollResults`,
// como el `Get.arguments` de Flutter.
export default function PollResultsScreen() {
  return <PendingScreen name="PollResultsScreen" replaces="poll_results_page.dart" />;
}
