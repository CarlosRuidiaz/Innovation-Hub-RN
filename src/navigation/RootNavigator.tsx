import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, View } from "react-native";

import { BackButton } from "../core/components/BackButton";
import ApplicationStatusScreen from "../features/application/presentation/screens/ApplicationStatusScreen";
import { useSession } from "../features/auth/presentation/context/SessionContext";
import CompleteProfileScreen from "../features/auth/presentation/screens/CompleteProfileScreen";
import LoginScreen from "../features/auth/presentation/screens/LoginScreen";
import SignupScreen from "../features/auth/presentation/screens/SignupScreen";
import ApplicantsScreen from "../features/management/presentation/screens/ApplicantsScreen";
import MyProjectsScreen from "../features/myProjects/presentation/screens/MyProjectsScreen";
import NotificationsScreen from "../features/notifications/presentation/screens/NotificationsScreen";
import CreatePollScreen from "../features/poll/presentation/screens/CreatePollScreen";
import PollResultsScreen from "../features/poll/presentation/screens/PollResultsScreen";
import RespondPollScreen from "../features/poll/presentation/screens/RespondPollScreen";
import ProfileScreen from "../features/profile/presentation/screens/ProfileScreen";
import CarteleraScreen from "../features/project/presentation/screens/CarteleraScreen";
import CreateIdeaScreen from "../features/project/presentation/screens/CreateIdeaScreen";
import IdeaPublishedScreen from "../features/project/presentation/screens/IdeaPublishedScreen";
import ProjectDetailScreen from "../features/project/presentation/screens/ProjectDetailScreen";
import ProjectFiltersScreen from "../features/project/presentation/screens/ProjectFiltersScreen";
import PrototypeFeedbackScreen from "../features/showcase/presentation/screens/PrototypeFeedbackScreen";
import ShowcaseScreen from "../features/showcase/presentation/screens/ShowcaseScreen";
import PublishUpdateScreen from "../features/workspace/presentation/screens/PublishUpdateScreen";
import WorkspaceScreen from "../features/workspace/presentation/screens/WorkspaceScreen";
import { AppColors, AppTypography } from "../theme/tokens";
import { BottomBar, HomeTabKeys } from "./BottomBar";
import { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// La barra de arriba del `appBarTheme` de Flutter: papel, sin sombra, titulo
// en Fraunces a la izquierda.
const headerLook = {
  headerStyle: { backgroundColor: AppColors.paper },
  headerTintColor: AppColors.ink,
  headerTitleStyle: AppTypography.appBarTitle,
  headerTitleAlign: "left" as const,
  headerShadowVisible: false,
};

// En la pila, ademas, la flecha de volver de la app, igual en Android y en el
// navegador.
const stackOptions: NativeStackNavigationOptions = {
  ...headerLook,
  headerBackVisible: false,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : null),
  contentStyle: { backgroundColor: AppColors.paper },
};

// La pestaña "Crear" no muestra nada: la barra inferior abre `CreateIdea`.
function NoScreen() {
  return null;
}

// Las cinco pestañas de `home_page.dart`. Cada pantalla de pestaña tiene su
// barra de arriba con el titulo de Flutter; la que necesite botones en ella
// los pone con `navigation.setOptions`, sin tocar este archivo.
function Tabs() {
  return (
    <View testID={HomeTabKeys.page} style={styles.flex}>
      <Tab.Navigator
        tabBar={(props) => <BottomBar {...props} />}
        screenOptions={{ ...headerLook, sceneStyle: { backgroundColor: AppColors.paper } }}
      >
        <Tab.Screen name="Home" component={CarteleraScreen} options={{ title: "Innovation Hub" }} />
        <Tab.Screen name="MyProjects" component={MyProjectsScreen} options={{ title: "Mis proyectos" }} />
        <Tab.Screen name="Create" component={NoScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notificaciones" }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
      </Tab.Navigator>
    </View>
  );
}

// La puerta de sesion de `central.dart`: sin sesion, el login y el registro;
// con sesion, la app. Al entrar o salir cambia sola, sin navegar a mano.
//
// Cada ruta importa su pantalla desde la carpeta de su funcionalidad: migrar
// una pantalla no toca este archivo. Los titulos son los del `AppBar` de cada
// pagina en Flutter; la vitrina y el prototipo pintan su propia cabecera, como
// alla.
export default function RootNavigator() {
  const { isLogged } = useSession();
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      {isLogged ? (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={({ route }) => ({ title: route.params.project.title })} />
          <Stack.Screen name="CreateIdea" component={CreateIdeaScreen} options={{ title: "Nueva idea de proyecto" }} />
          <Stack.Screen name="IdeaPublished" component={IdeaPublishedScreen} options={{ title: "Idea publicada" }} />
          <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} options={{ title: "Mi postulación" }} />
          <Stack.Screen name="Applicants" component={ApplicantsScreen} options={{ title: "Gestión de postulantes" }} />
          <Stack.Screen name="ProjectFilters" component={ProjectFiltersScreen} options={{ title: "Filtros" }} />
          <Stack.Screen name="Workspace" component={WorkspaceScreen} options={({ route }) => ({ title: route.params.project.title })} />
          <Stack.Screen name="PublishUpdate" component={PublishUpdateScreen} options={{ title: "Publicar avance" }} />
          <Stack.Screen name="Showcase" component={ShowcaseScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PrototypeDetail" component={PrototypeFeedbackScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreatePoll" component={CreatePollScreen} options={{ title: "Crear Encuesta" }} />
          <Stack.Screen name="RespondPoll" component={RespondPollScreen} options={({ route }) => ({ title: route.params.poll.title })} />
          <Stack.Screen name="PollResults" component={PollResultsScreen} options={{ title: "Resultados" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Crear cuenta" }} />
          <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} options={{ title: "Completa tu perfil" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
