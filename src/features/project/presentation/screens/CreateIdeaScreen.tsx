import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `create_idea_page.dart`. La migra su carril.
export default function CreateIdeaScreen() {
  return <PendingScreen name="CreateIdeaScreen" testID={CreateIdeaScreen.key} replaces="create_idea_page.dart" />;
}

// La `Key` de la pagina en Flutter. Las pruebas de la base la buscan: al
// reemplazar esta pantalla, se conserva con este mismo nombre.
CreateIdeaScreen.key = "CreateIdeaPage";
