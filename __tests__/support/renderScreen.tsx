import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { render } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Container } from "@/src/core/di/container";
import { DIProvider } from "@/src/core/di/DIProvider";
import { SnackbarProvider } from "@/src/core/feedback/SnackbarProvider";
import { SessionProvider } from "@/src/features/auth/presentation/context/SessionContext";
import { FollowsProvider } from "@/src/features/follow/presentation/context/FollowsContext";
import { ProfileProvider } from "@/src/features/profile/presentation/context/ProfileContext";
import { ProjectsProvider } from "@/src/features/project/presentation/context/ProjectsContext";
import { lightTheme } from "@/src/theme/theme";

// Lo que en Flutter era `GetMaterialApp(home: LaPantalla())`: una pantalla
// suelta con lo que necesita alrededor. En React Native eso es mas cosas (el
// tema de Paper, el area segura, la navegacion y los contextos que la pantalla
// lee), asi que va en un solo sitio.
export const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Stack = createNativeStackNavigator();

type Options = {
  // Los parametros de la ruta, como los `Get.arguments` de Flutter.
  params?: object;
  // Otras rutas a las que la pantalla puede navegar: `{ Signup: SignupScreen }`.
  routes?: Record<string, React.ComponentType<any>>;
};

export function renderScreen(screen: React.ComponentType<any>, container: Container, { params, routes = {} }: Options = {}) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <DIProvider container={container}>
        <PaperProvider theme={lightTheme}>
          <SnackbarProvider>
            <SessionProvider>
              <ProfileProvider>
                <ProjectsProvider>
                  <FollowsProvider>
                    <NavigationContainer>
                      <Stack.Navigator>
                        <Stack.Screen name="Screen" component={screen} initialParams={params} />
                        {Object.entries(routes).map(([name, component]) => (
                          <Stack.Screen key={name} name={name} component={component} />
                        ))}
                      </Stack.Navigator>
                    </NavigationContainer>
                  </FollowsProvider>
                </ProjectsProvider>
              </ProfileProvider>
            </SessionProvider>
          </SnackbarProvider>
        </PaperProvider>
      </DIProvider>
    </SafeAreaProvider>,
  );
}
