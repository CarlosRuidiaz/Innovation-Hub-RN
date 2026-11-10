import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { Pill } from "@/src/core/components/Pill";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { ProgressUpdate } from "../../domain/entities/ProgressUpdate";
import { useWorkspace } from "../viewmodels/WorkspaceViewModelContext";
import { useRefreshControl } from "./refreshControl";

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

const dateOf = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

// Pestaña "Avances": `progress_tab.dart`. La bitacora del proyecto, la mas
// reciente arriba, y el boton para publicar un avance.
export function ProgressTab() {
  const vm = useWorkspace();
  const navigation = useNavigation();
  const refreshControl = useRefreshControl(vm.reload);
  const { updates, project } = vm;

  return (
    <View style={styles.flex}>
      <FlatList
        testID={ProgressTab.key}
        style={styles.flex}
        data={updates}
        keyExtractor={(u, i) => u.id ?? `${i}`}
        refreshControl={refreshControl}
        contentContainerStyle={updates.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Todavía no hay avances. Publica el primero para contarle al equipo en qué van.
          </Text>
        }
        renderItem={({ item, index }) => <TimelineItem update={item} last={index === updates.length - 1} />}
      />
      <View style={styles.footer}>
        <PrimaryButton
          testID={ProgressTab.publishKey}
          label="Publicar avance"
          onPress={project == null ? undefined : () => navigation.navigate("PublishUpdate", { project })}
        />
      </View>
    </View>
  );
}

ProgressTab.key = "workspace.progress";
ProgressTab.publishKey = "workspace.progress.publish";

function TimelineItem({ update, last }: { update: ProgressUpdate; last: boolean }) {
  return (
    <View style={styles.item}>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {!last ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.body}>
        <Text style={AppTypography.timelineDate}>{dateOf(update.createdAt)}</Text>
        <Text style={[AppTypography.titleMedium, styles.gapXs]}>{update.title}</Text>
        <Text style={[AppTypography.bodyMedium, styles.gapXs]}>{update.description}</Text>
        <View style={styles.pill}>
          <Pill label={`${update.completionPercentage} % al publicarse`} background={AppColors.card} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: AppTokens.gapL },
  // Vacia, el texto queda centrado y la lista sigue pudiendo deslizarse.
  emptyList: { flexGrow: 1, justifyContent: "center", padding: AppTokens.gapXl },
  empty: { ...AppTypography.bodyMedium, textAlign: "center" },
  footer: { padding: AppTokens.gapL },
  item: { flexDirection: "row" },
  rail: { alignItems: "center" },
  dot: {
    width: AppTokens.timelineDotSize,
    height: AppTokens.timelineDotSize,
    borderRadius: AppTokens.pillRadius,
    backgroundColor: AppColors.persimmon,
  },
  line: { flex: 1, width: AppTokens.timelineLineWidth, backgroundColor: AppColors.secondary },
  body: { flex: 1, marginLeft: AppTokens.gapM, paddingBottom: AppTokens.gapL },
  gapXs: { marginTop: AppTokens.gapXs },
  pill: { marginTop: AppTokens.gapS },
});
