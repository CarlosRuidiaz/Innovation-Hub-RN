import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";

import { BackButton } from "../core/components/BackButton";
import CompleteProfileScreen from "../features/auth/presentation/screens/CompleteProfileScreen";
import LoginScreen from "../features/auth/presentation/screens/LoginScreen";
import SignupScreen from "../features/auth/presentation/screens/SignupScreen";
import { useSession } from "../features/auth/presentation/context/SessionContext";
import HomeScreen from "../features/home/HomeScreen";
import { AppColors, AppTypography } from "../theme/tokens";
import { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// La barra de arriba del `appBarTheme` de Flutter: papel, sin sombra, titulo
// en Fraunces a la izquierda y la flecha de volver de la app.
const headerOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: AppColors.paper },
  headerTintColor: AppColors.ink,
  headerTitleStyle: AppTypography.appBarTitle,
  headerTitleAlign: "left",
  headerShadowVisible: false,
  headerBackVisible: false,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : null),
  contentStyle: { backgroundColor: AppColors.paper },
};

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

// La puerta de sesion de `central.dart`: sin sesion, el login y el registro;
// con sesion, la app. Al entrar o salir cambia sola, sin navegar a mano.
export default function RootNavigator() {
  const { isLogged } = useSession();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      {isLogged ? (
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
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
