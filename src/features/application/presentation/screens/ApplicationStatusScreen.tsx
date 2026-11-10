import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `application_status_page.dart`. La migra su carril.
// Recibe la postulacion (`application`) por los parametros de la ruta `ApplicationStatus`,
// como el `Get.arguments` de Flutter.
export default function ApplicationStatusScreen() {
  return <PendingScreen name="ApplicationStatusScreen" replaces="application_status_page.dart" />;
}
