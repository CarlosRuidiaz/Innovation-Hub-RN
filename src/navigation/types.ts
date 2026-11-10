import { NavigatorScreenParams } from "@react-navigation/native";

import { Application } from "../features/application/domain/entities/Application";
import { Poll } from "../features/poll/domain/entities/Poll";
import { Project } from "../features/project/domain/entities/Project";

// Las pestañas de la barra inferior (`home_page.dart`). "Create" no muestra
// nada: tocarla abre `CreateIdea` encima.
export type TabParamList = {
  Home: undefined;
  MyProjects: undefined;
  Create: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Las rutas de la pila. Los parametros de cada una son los mismos
// `Get.arguments` que recibe esa pagina en Flutter (`lib/core/app_routes.dart`).
export type RootStackParamList = {
  // Sin sesion.
  Login: undefined;
  Signup: undefined;
  // Las credenciales del paso 1 viajan al paso 2, como el constructor de
  // `CompleteProfilePage` en Flutter: la cuenta se crea alli, con todo junto.
  CompleteProfile: { email: string; password: string };

  // Con sesion.
  Tabs: NavigatorScreenParams<TabParamList>;
  // Pantalla 07.
  ProjectDetail: { project: Project };
  // Pantalla 10.
  CreateIdea: undefined;
  // Pantalla 11: el proyecto recien creado.
  IdeaPublished: { project: Project };
  // Pantallas 14 y 19: la misma pantalla, dirigida por el estado.
  ApplicationStatus: { application: Application };
  // Pantalla 18.
  Applicants: { project: Project };
  // Lee y escribe los filtros de `ProjectsContext`: no recibe nada.
  ProjectFilters: undefined;
  Workspace: { project: Project };
  PublishUpdate: { project: Project };
  // Pantalla 28.
  Showcase: undefined;
  // Pantalla 29.
  PrototypeDetail: { project: Project };
  CreatePoll: { project: Project };
  RespondPoll: { poll: Poll };
  PollResults: { poll: Poll };
};

// Hace que useNavigation() y navigation.navigate() se revisen en toda la app.
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
