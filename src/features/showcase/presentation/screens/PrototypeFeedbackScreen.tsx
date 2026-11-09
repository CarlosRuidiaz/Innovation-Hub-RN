import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `prototype_feedback_page.dart`. La migra su carril.
// Recibe el proyecto (`project`) por los parametros de la ruta `PrototypeDetail`,
// como el `Get.arguments` de Flutter.
export default function PrototypeFeedbackScreen() {
  return <PendingScreen name="PrototypeFeedbackScreen" replaces="prototype_feedback_page.dart" withBack />;
}
