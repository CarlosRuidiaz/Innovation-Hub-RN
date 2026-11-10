import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";

import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { isActive } from "../../domain/entities/Poll";
import { usePollViewModel } from "../viewmodels/usePollViewModel";

const pad = (n: number) => `${n}`.padStart(2, "0");

// "2026-11-16 23:59:00": lo que imprime en Flutter `closesAt.toLocal()` sin los
// milisegundos.
const closingOf = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

// Los resultados de una encuesta: `poll_results_page.dart`. Por pregunta, el
// conteo y el porcentaje de cada opcion con su barra; despues, los comentarios.
// Deslizar hacia abajo vuelve a pedir las respuestas.
export default function PollResultsScreen() {
  const { poll } = useRoute<RouteProp<RootStackParamList, "PollResults">>().params;
  const vm = usePollViewModel();
  const [refreshing, setRefreshing] = useState(false);

  const { loadResponsesForPoll } = vm;
  useEffect(() => {
    if (poll.id != null) loadResponsesForPoll(poll.id);
  }, [loadResponsesForPoll, poll.id]);

  const onRefresh = useCallback(async () => {
    if (poll.id == null) return;
    setRefreshing(true);
    try {
      await loadResponsesForPoll(poll.id);
    } finally {
      setRefreshing(false);
    }
  }, [loadResponsesForPoll, poll.id]);

  if (vm.isLoading) {
    return (
      <View testID={PollResultsScreen.key} style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.persimmon} />
      </View>
    );
  }

  const responses = vm.pollResponses[poll.id ?? ""] ?? [];
  const total = responses.length;
  const comments = responses.filter((r) => r.comment != null && r.comment.length > 0);

  return (
    <ScrollView
      testID={PollResultsScreen.key}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[AppColors.persimmon]}
          tintColor={AppColors.persimmon}
          progressBackgroundColor={AppColors.card}
        />
      }
    >
      <Text style={AppTypography.headlineSmall}>{poll.title}</Text>
      {isActive(poll) ? (
        <Text style={[AppTypography.bodyMedium, styles.closing]}>{`Abierta hasta ${closingOf(poll.closesAt)}`}</Text>
      ) : null}
      <View style={styles.gapXl} />
      {poll.questions.map((question, i) => (
        <View key={i}>
          <Text style={AppTypography.titleMedium}>{`${i + 1}. ${question.text}`}</Text>
          <View style={styles.gapM} />
          {question.options.map((option, j) => {
            const count = responses.filter((r) => r.answers.length > i && r.answers[i] === j).length;
            const percent = total > 0 ? count / total : 0;
            return (
              <View key={j} style={styles.option}>
                <View style={styles.optionRow}>
                  <Text style={[AppTypography.bodyMedium, styles.flex]}>{option}</Text>
                  <Text style={AppTypography.resultCount}>{`${count} (${(percent * 100).toFixed(1)}%)`}</Text>
                </View>
                <View
                  testID={PollResultsScreen.barKey(i, j)}
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: Math.round(percent * 100) }}
                  style={styles.track}
                >
                  <View style={[styles.fill, { width: `${percent * 100}%` }]} />
                </View>
              </View>
            );
          })}
          <View style={styles.gapM} />
        </View>
      ))}
      <View style={styles.gapXl} />
      <Text style={AppTypography.titleMedium}>Comentarios</Text>
      <View style={styles.gapM} />
      {comments.length === 0 ? (
        <Text style={AppTypography.bodyMedium}>No hay comentarios.</Text>
      ) : (
        comments.map((r, k) => (
          <Card key={r.id ?? `${k}`} style={styles.card}>
            <Text style={[AppTypography.bodyMedium, styles.cardBody]}>{r.comment}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

PollResultsScreen.key = "PollResultsPage";
PollResultsScreen.barKey = (question: number, option: number) => `PollResultsPage.q${question}.o${option}.bar`;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: AppTokens.gapL },
  flex: { flex: 1 },
  gapM: { height: AppTokens.gapM },
  gapXl: { height: AppTokens.gapXl },
  closing: { color: AppColors.secondary, marginTop: AppTokens.gapS },
  option: { marginBottom: AppTokens.gapM },
  optionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: AppTokens.gapXs },
  track: { height: AppTokens.resultBarHeight, backgroundColor: AppColors.card, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: AppColors.persimmon },
  card: { marginBottom: AppTokens.gapS, backgroundColor: AppColors.card },
  cardBody: { padding: AppTokens.gapM },
});
