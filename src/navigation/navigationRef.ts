import { createNavigationContainerRef } from "@react-navigation/native";

import { RootStackParamList } from "./types";

// Para navegar desde fuera de una pantalla, como en r_market (un aviso, un
// proveedor). Las pantallas usan `useNavigation()`.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
