import React from "react";

import { PendingScreen } from "@/src/core/components/PendingScreen";

// Provisional: reemplaza a `cartelera_view.dart`. La migra su carril.
export default function CarteleraScreen() {
  return <PendingScreen name="CarteleraScreen" testID={CarteleraScreen.key} replaces="cartelera_view.dart" />;
}

// La `Key` de la pagina en Flutter. Las pruebas de la base la buscan: al
// reemplazar esta pantalla, se conserva con este mismo nombre.
CarteleraScreen.key = "CarteleraView";
