import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `applicants_page.dart`. La migra su carril.
// Recibe el proyecto (`project`) por los parametros de la ruta `Applicants`,
// como el `Get.arguments` de Flutter.
export default function ApplicantsScreen() {
  return <PendingScreen name="ApplicantsScreen" replaces="applicants_page.dart" />;
}
