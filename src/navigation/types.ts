import { NavigatorScreenParams } from "@react-navigation/native";

// Las pantallas de la barra inferior.
export type TabParamList = {
  Home: undefined;
};

// Las pantallas de la pila.
export type RootStackParamList = {
  // Sin sesion.
  Login: undefined;
  Signup: undefined;
  // Las credenciales del paso 1 viajan al paso 2, como el constructor de
  // `CompleteProfilePage` en Flutter: la cuenta se crea alli, con todo junto.
  CompleteProfile: { email: string; password: string };

  // Con sesion.
  Tabs: NavigatorScreenParams<TabParamList>;
};

// Hace que useNavigation() y navigation.navigate() se revisen en toda la app.
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
