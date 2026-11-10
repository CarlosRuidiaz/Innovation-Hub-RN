import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card } from "react-native-paper";

import { Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { isActive, Poll } from "../../domain/entities/Poll";
import { usePollViewModel } from "../viewmodels/usePollViewModel";

// Las encuestas del proyecto en el resumen del espacio de trabajo:
// `workspace_polls_block.dart`. Todas, abiertas y cerradas, con el boton para
// crear una. Tocar una abre sus resultados: el equipo siempre puede verlos.
//
// Se recarga cada vez que la pantalla vuelve a verse (al volver de crear una
// encuesta, por ejemplo), como en Flutter, que la pedia en cada `build`.
export function WorkspacePollsBlock({ project }: { project: Project }) {
  const vm = usePollViewModel();
  const navigation = useNavigation();
  const projectId = project.id;

  const { loadPollsForProject } = vm;
  useFocusEffect(
    useCallback(() => {
      if (projectId != null) loadPollsForProject(projectId);
    }, [loadPollsForProject, projectId]),
  );

  if (projectId == null) return null;
  const polls = vm.projectPolls[projectId] ?? [];

  return (
    <View testID={WorkspacePollsBlock.key}>
      <View style={styles.header}>
        <Text style={AppTypography.titleMedium}>Validación</Text>
        <Button
          testID={WorkspacePollsBlock.createKey}
          mode="text"
          icon={({ size, color }) => <MaterialIcons name="add" size={size} color={color} />}
          onPress={() => navigation.navigate("CreatePoll", { project })}
        >
          Crear encuesta
        </Button>
      </View>
      <View style={styles.gapM} />
      {polls.length === 0 ? (
        <Text style={AppTypography.bodyMedium}>No hay encuestas creadas.</Text>
      ) : (
        polls.map((poll, i) => (
          <WorkspacePollCard
            key={poll.id ?? `${i}`}
            poll={poll}
            onPress={() => navigation.navigate("PollResults", { poll })}
          />
        ))
      )}
    </View>
  );
}

WorkspacePollsBlock.key = "WorkspacePollsBlock";
WorkspacePollsBlock.createKey = "WorkspacePollsBlock.create";
WorkspacePollsBlock.pollKey = (id: string) => `WorkspacePollsBlock.poll.${id}`;

function WorkspacePollCard({ poll, onPress }: { poll: Poll; onPress: () => void }) {
  const active = isActive(poll);
  return (
    <Card testID={WorkspacePollsBlock.pollKey(poll.id ?? "")} style={styles.card} onPress={onPress}>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={[AppTypography.labelLarge, styles.flex]}>{poll.title}</Text>
          <Text style={[AppTypography.resultCount, styles.status, { color: active ? AppColors.gold : AppColors.secondary }]}>
            {active ? "Activa" : "Cerrada"}
          </Text>
        </View>
        {poll.audienceProgram != null ? (
          <Text style={[AppTypography.bodySmall, styles.audience]}>{`Para: ${poll.audienceProgram}`}</Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gapM: { height: AppTokens.gapM },
  card: { marginBottom: AppTokens.gapS, backgroundColor: AppColors.card },
  cardBody: { padding: AppTokens.gapM },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  // "Activa" / "Cerrada" van en `bodySmall` y negrita en Flutter.
  status: { fontSize: AppTypography.bodySmall.fontSize },
  audience: { marginTop: AppTokens.gapXs },
});
