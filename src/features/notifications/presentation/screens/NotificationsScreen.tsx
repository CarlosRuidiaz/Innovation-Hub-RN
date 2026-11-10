import React from "react";
import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/src/core/components/EmptyState";
import { AppColors } from "@/src/theme/tokens";

// La pestaña de notificaciones: el `_NotificationsEmptyView` de
// `home_page.dart`. En Flutter todavia no hay notificaciones, solo la vista
// vacia.
export default function NotificationsScreen() {
  return (
    <View testID={NotificationsScreen.key} style={styles.screen}>
      <EmptyState icon="notifications-none" title="Todavía no tienes notificaciones" />
    </View>
  );
}

NotificationsScreen.key = "NotificationsView";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.paper },
});
