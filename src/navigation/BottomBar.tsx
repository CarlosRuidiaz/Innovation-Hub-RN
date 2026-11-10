import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppColors, AppTokens, AppTypography } from "../theme/tokens";
import { TabParamList } from "./types";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

// Las `Key` de las pestañas en Flutter, como `testID`.
export const HomeTabKeys = {
  // La pagina con la barra inferior: verla es estar dentro de la app.
  page: "HomePage",
  home: "NavInicio",
  myProjects: "NavMisProyectos",
  create: "NavCrear",
  notifications: "NavNotificaciones",
  profile: "NavPerfil",
} as const;

// Cada pestaña con su icono normal y el de cuando esta activa. Inicio y Mis
// proyectos usan el mismo en los dos estados: `MaterialIcons` no trae la casa
// ni la carpeta en contorno. Lo activo se ve tambien en la etiqueta en negrita
// y la raya persimmon, como en Flutter.
const ITEMS: Record<Exclude<keyof TabParamList, "Create">, { key: string; label: string; icon: IconName; activeIcon: IconName }> = {
  Home: { key: HomeTabKeys.home, label: "Inicio", icon: "home", activeIcon: "home" },
  MyProjects: { key: HomeTabKeys.myProjects, label: "Mis proyectos", icon: "folder", activeIcon: "folder" },
  Notifications: { key: HomeTabKeys.notifications, label: "Notificaciones", icon: "notifications-none", activeIcon: "notifications" },
  Profile: { key: HomeTabKeys.profile, label: "Perfil", icon: "person-outline", activeIcon: "person" },
};

// La barra inferior de `home_page.dart`: fondo papel con una raya de tinta
// arriba, cinco pestañas y "Crear" al centro. "Crear" no es una pestaña: abre
// la pantalla de nueva idea encima.
export function BottomBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: AppTokens.navBarPaddingBottom + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const name = route.name as keyof TabParamList;
        if (name === "Create") {
          return (
            <Pressable
              key={route.key}
              testID={HomeTabKeys.create}
              accessibilityRole="button"
              accessibilityLabel="Crear"
              onPress={() => navigation.navigate("CreateIdea")}
              style={styles.item}
            >
              <View style={styles.createButton}>
                <MaterialIcons name="add" size={AppTokens.iconSizeSmall} color={AppColors.white} />
              </View>
              <Text style={[AppTypography.navLabel, styles.label]} numberOfLines={1}>
                Crear
              </Text>
              <View style={styles.createSpace} />
            </Pressable>
          );
        }
        const item = ITEMS[name];
        const active = state.index === index;
        return (
          <Pressable
            key={route.key}
            testID={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!active && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.item}
          >
            <MaterialIcons name={active ? item.activeIcon : item.icon} size={AppTokens.iconSize} color={AppColors.ink} />
            <Text style={[active ? AppTypography.navLabelActive : AppTypography.navLabel, styles.label]} numberOfLines={1}>
              {item.label}
            </Text>
            <View style={[styles.indicator, active ? styles.indicatorActive : null]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: AppColors.paper,
    borderTopColor: AppColors.ink,
    borderTopWidth: AppTokens.borderWidth,
    paddingTop: AppTokens.navBarPaddingTop,
  },
  item: { flex: 1, alignItems: "center", paddingVertical: AppTokens.gapXs },
  label: { marginTop: AppTokens.gapXs, textAlign: "center" },
  indicator: {
    marginTop: AppTokens.gapXs,
    width: AppTokens.navIndicatorWidth,
    height: AppTokens.navIndicatorHeight,
    borderRadius: AppTokens.navIndicatorRadius,
  },
  indicatorActive: { backgroundColor: AppColors.persimmon },
  createButton: {
    width: AppTokens.navCreateWidth,
    height: AppTokens.navCreateHeight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.ink,
    borderRadius: AppTokens.radius,
  },
  createSpace: { height: AppTokens.navCreateBottomSpace },
});
