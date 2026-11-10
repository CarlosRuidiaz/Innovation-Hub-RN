import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { StageChip } from "@/src/core/components/StageChip";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { ProgressBar } from "../components/ProgressBar";
import { ProgressTab } from "../components/ProgressTab";
import { SummaryTab } from "../components/SummaryTab";
import { TasksTab } from "../components/TasksTab";
import { useWorkspaceViewModel } from "../viewmodels/useWorkspaceViewModel";
import { WorkspaceViewModelProvider } from "../viewmodels/WorkspaceViewModelContext";

const TABS = ["Resumen", "Avances", "Tareas"] as const;

// El espacio de trabajo del proyecto: `workspace_page.dart`. El lugar privado
// del equipo, distinto del detalle publico. Solo entran el lider y los
// miembros aceptados.
//
// Las pestañas van dentro de la pantalla, sin otra libreria de navegacion: se
// cambian tocando su titulo (en Flutter tambien se podia deslizar de lado).
export default function WorkspaceScreen() {
  const { project } = useRoute<RouteProp<RootStackParamList, "Workspace">>().params;
  const vm = useWorkspaceViewModel();
  const [tab, setTab] = useState(0);

  // Una sola vez por pantalla: el perfil se pide cada vez que se abre, para
  // que otra cuenta no herede los permisos de la anterior.
  const { open, reload } = vm;
  useEffect(() => {
    open(project);
  }, [open, project]);

  // Al volver de publicar un avance (o de las encuestas) se piden los datos de
  // nuevo sin vaciar la pantalla. En Flutter no hacia falta: el controlador
  // era el mismo para las dos pantallas.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reload();
    }, [reload]),
  );

  // El indicador de carga a pantalla completa es solo para cuando aun no hay
  // nada que enseñar: al refrescar, la pantalla se queda como esta.
  if (!vm.hasData) {
    if (vm.failed) {
      return (
        <View testID={WorkspaceScreen.key} style={styles.center}>
          <Text style={[AppTypography.bodyMedium, styles.centerText]}>No pudimos cargar el espacio de trabajo.</Text>
          <PrimaryButton testID={WorkspaceScreen.retryKey} label="Reintentar" onPress={() => open(project)} />
        </View>
      );
    }
    return (
      <View testID={WorkspaceScreen.key} style={styles.center}>
        <ActivityIndicator testID={WorkspaceScreen.loadingKey} size="large" color={AppColors.persimmon} />
      </View>
    );
  }

  if (!vm.canEnter) {
    return (
      <View testID={WorkspaceScreen.key} style={styles.center}>
        <Text style={[AppTypography.bodyMedium, styles.centerText]}>
          No tienes acceso a este espacio de trabajo: es solo para el líder y los miembros aceptados.
        </Text>
      </View>
    );
  }

  // La copia viva: la etapa pudo cambiar desde que se abrio la pantalla.
  const current = vm.project ?? project;
  const total = vm.totalMilestones;

  return (
    <WorkspaceViewModelProvider value={vm}>
      <View testID={WorkspaceScreen.key} style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[AppTypography.headlineMedium, styles.flex]}>{current.title}</Text>
            <StageChip stage={current.stage} />
          </View>
          <View style={styles.progressRow}>
            <Text style={AppTypography.bodyMedium}>
              {total === 0 ? "Sin hitos todavía" : `Avance · ${vm.completedMilestones} de ${total} hitos`}
            </Text>
            <Text style={AppTypography.titleMedium}>{`${vm.progressPercent} %`}</Text>
          </View>
          <ProgressBar percent={vm.progressPercent} />
        </View>

        <View style={styles.tabBar} accessibilityRole="tablist">
          {TABS.map((label, i) => (
            <Pressable
              key={label}
              testID={WorkspaceScreen.tabKey(i)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === i }}
              onPress={() => setTab(i)}
              style={styles.tab}
            >
              <Text style={tab === i ? AppTypography.tab : AppTypography.tabUnselected}>{label}</Text>
              {tab === i ? <View style={styles.indicator} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.flex}>
          {tab === 0 ? <SummaryTab /> : null}
          {tab === 1 ? <ProgressTab /> : null}
          {tab === 2 ? <TasksTab /> : null}
        </View>
      </View>
    </WorkspaceViewModelProvider>
  );
}

WorkspaceScreen.key = "WorkspacePage";
WorkspaceScreen.loadingKey = "WorkspacePage.loading";
WorkspaceScreen.retryKey = "WorkspacePage.retry";
WorkspaceScreen.tabKey = (index: number) => `WorkspacePage.tab.${index}`;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: AppTokens.gapL, gap: AppTokens.gapM },
  centerText: { textAlign: "center" },
  header: { paddingHorizontal: AppTokens.gapL, paddingTop: AppTokens.gapL, paddingBottom: AppTokens.gapS },
  titleRow: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapS },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: AppTokens.gapM,
    marginBottom: AppTokens.gapS,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: AppTokens.tabDividerHeight,
    borderBottomColor: AppColors.ink,
  },
  tab: { flex: 1, height: AppTokens.tabHeight, alignItems: "center", justifyContent: "center" },
  indicator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: AppTokens.tabIndicatorHeight,
    backgroundColor: AppColors.persimmon,
  },
});
