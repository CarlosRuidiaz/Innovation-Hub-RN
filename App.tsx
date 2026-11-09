import { Archivo_400Regular, Archivo_600SemiBold, Archivo_700Bold } from "@expo-google-fonts/archivo";
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

import { Container } from "./src/core/di/container";
import { DIProvider } from "./src/core/di/DIProvider";
import { createLocalContainer } from "./src/core/di/localContainer";
import { SnackbarProvider } from "./src/core/feedback/SnackbarProvider";
import { MissingConfigScreen } from "./src/core/roble/MissingConfigScreen";
import { missingRobleConfig, useLocalData } from "./src/core/roble/robleConfig";
import { FollowsProvider } from "./src/features/follow/presentation/context/FollowsContext";
import { ProjectsProvider } from "./src/features/project/presentation/context/ProjectsContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { darkTheme, lightTheme } from "./src/theme/theme";

// Expo Go doesn't support customizing the splash screen; only apply options in development/production builds.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Keep the native splash screen visible until the app has finished loading.
SplashScreen.preventAutoHideAsync();
if (!isExpoGo) {
  SplashScreen.setOptions({ duration: 400, fade: true });
}

// Con datos en memoria se crea una sola vez: es el «servidor» de esta corrida.
const localContainer = useLocalData ? createLocalContainer() : undefined;

export default function App() {
  return <AppRoot container={localContainer} />;
}

// `container` deja que las pruebas cambien los datasources de Roble por los de memoria.
export function AppRoot({ container }: { container?: Container }) {
  const [appIsReady, setAppIsReady] = useState(false);
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  // Sin `.env` no hay a que servidor conectarse: mejor decirlo en pantalla que
  // fallar despues con un error de red que no explica nada.
  const missing = container ? [] : missingRobleConfig();

  useEffect(() => {
    async function prepare() {
      try {
        // Load anything the first screen needs here (fonts, saved preferences, session...).
        // Paper dibuja sus iconos con MaterialCommunityIcons; la app, con
        // MaterialIcons (los mismos nombres de Flutter). Y las dos familias de
        // Cartelera: Fraunces para titulares y Archivo para el resto.
        await Font.loadAsync({
          ...MaterialCommunityIcons.font,
          ...MaterialIcons.font,
          Fraunces_600SemiBold,
          Fraunces_700Bold,
          Archivo_400Regular,
          Archivo_600SemiBold,
          Archivo_700Bold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (missing.length > 0) {
    return (
      <PaperProvider theme={theme}>
        <MissingConfigScreen missing={missing} />
      </PaperProvider>
    );
  }

  const navigationTheme = {
    ...(scheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      primary: theme.colors.primary,
      notification: theme.colors.error,
    },
  };

  return (
    <DIProvider container={container}>
      <PaperProvider theme={theme}>
        <SnackbarProvider>
          <ProjectsProvider>
            <FollowsProvider>
              <NavigationContainer theme={navigationTheme}>
                <RootNavigator />
              </NavigationContainer>
            </FollowsProvider>
          </ProjectsProvider>
        </SnackbarProvider>
      </PaperProvider>
    </DIProvider>
  );
}
