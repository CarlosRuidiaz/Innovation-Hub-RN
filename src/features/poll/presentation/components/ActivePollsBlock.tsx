import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";

import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { isActive, Poll } from "../../domain/entities/Poll";
import { usePollViewModel } from "../viewmodels/usePollViewModel";

// Las encuestas abiertas del proyecto, en el detalle: `active_polls_block.dart`.
// Lo pone el detalle del proyecto. Sin encuestas activas no muestra nada.
//
// Tocar una lleva a los resultados si quien mira puede verlos (ya respondio o
// es del equipo); si no, a responderla si puede; y si no puede ninguna de las
// dos, lo avisa.
//
// Se recarga cada vez que la pantalla vuelve a verse (al volver de responder,
// por ejemplo), como en Flutter, que la pedia en cada `build`.
export function ActivePollsBlock({ project }: { project: Project }) {
  const vm = usePollViewModel();
  const navigation = useNavigation();
  const snackbar = useSnackbar();
  const projectId = project.id;

  const { loadPollsForProject } = vm;
  useFocusEffect(
    useCallback(() => {
      if (projectId != null) loadPollsForProject(projectId);
    }, [loadPollsForProject, projectId]),
  );

  if (projectId == null) return null;
  const active = (vm.projectPolls[projectId] ?? []).filter((p) => isActive(p));
  if (active.length === 0) return null;

  const openPoll = async (poll: Poll) => {
    try {
      if (await vm.canViewResults(poll)) {
        navigation.navigate("PollResults", { poll });
        return;
      }
      if (await vm.canRespond(poll)) {
        navigation.navigate("RespondPoll", { poll });
        return;
      }
    } catch {
      // Si no se pudo comprobar, no se abre nada: cae en el aviso de abajo.
    }
    snackbar("No puedes responder ni ver los resultados de esta encuesta.", { title: "Acceso denegado" });
  };

  return (
    <View testID={ActivePollsBlock.key}>
      <View style={styles.gapXl} />
      <Text style={AppTypography.titleMedium}>Encuestas activas</Text>
      <View style={styles.gapM} />
      {active.map((poll, i) => (
        <Card
          key={poll.id ?? `${i}`}
          testID={ActivePollsBlock.pollKey(poll.id ?? "")}
          style={styles.card}
          onPress={() => openPoll(poll)}
        >
          <View style={styles.cardBody}>
            <Text style={AppTypography.labelLarge}>{poll.title}</Text>
            {poll.audienceProgram != null ? (
              <Text style={[AppTypography.bodySmall, styles.audience]}>{`Para: ${poll.audienceProgram}`}</Text>
            ) : null}
          </View>
        </Card>
      ))}
    </View>
  );
}

ActivePollsBlock.key = "ActivePollsBlock";
ActivePollsBlock.pollKey = (id: string) => `ActivePollsBlock.poll.${id}`;

const styles = StyleSheet.create({
  gapM: { height: AppTokens.gapM },
  gapXl: { height: AppTokens.gapXl },
  card: { marginBottom: AppTokens.gapS, backgroundColor: AppColors.card },
  cardBody: { padding: AppTokens.gapM },
  audience: { marginTop: AppTokens.gapXs },
});
