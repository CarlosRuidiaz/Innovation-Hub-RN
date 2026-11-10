import { RouteProp, StackActions, useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RadioButton } from "react-native-paper";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { TextField } from "@/src/core/components/TextField";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { newPollResponse } from "../../domain/entities/PollResponse";
import { usePollViewModel } from "../viewmodels/usePollViewModel";

// Responder una encuesta: `respond_poll_page.dart`. Una opcion por pregunta y
// un comentario opcional. Al enviar, los resultados reemplazan esta pantalla.
export default function RespondPollScreen() {
  const { poll } = useRoute<RouteProp<RootStackParamList, "RespondPoll">>().params;
  const navigation = useNavigation();
  const snackbar = useSnackbar();
  const { currentUser } = useSession();
  const vm = usePollViewModel();

  const [answers, setAnswers] = useState<(number | null)[]>(() => poll.questions.map(() => null));
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const choose = (question: number, option: number) =>
    setAnswers((prev) => prev.map((a, k) => (k === question ? option : a)));

  const send = async () => {
    if (answers.some((a) => a == null)) {
      snackbar("Debes responder todas las preguntas", { title: "Error" });
      return;
    }

    setSending(true);
    const user = currentUser();
    if (user == null || poll.id == null) {
      setSending(false);
      return;
    }

    const created = await vm.respondPoll(
      newPollResponse({
        pollId: poll.id,
        respondentId: user.userId,
        answers: answers as number[],
        comment: comment.trim(),
      }),
    );
    setSending(false);

    if (created != null) {
      // El `Get.offNamed` de Flutter: los resultados toman el lugar de esta pantalla.
      navigation.dispatch(StackActions.replace("PollResults", { poll }));
    } else {
      snackbar("No se pudo enviar la respuesta", { title: "Error" });
    }
  };

  return (
    <ScrollView testID={RespondPollScreen.key} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {poll.description.length > 0 ? (
        <>
          <Text style={AppTypography.bodyLarge}>{poll.description}</Text>
          <View style={styles.gapXl} />
        </>
      ) : null}
      {poll.questions.map((question, i) => (
        <View key={i}>
          <Text style={AppTypography.titleMedium}>{`${i + 1}. ${question.text}`}</Text>
          <View style={styles.gapS} />
          {question.options.map((option, j) => (
            <Pressable
              key={j}
              testID={RespondPollScreen.optionKey(i, j)}
              accessibilityRole="radio"
              accessibilityState={{ checked: answers[i] === j }}
              onPress={() => choose(i, j)}
              style={styles.option}
            >
              <RadioButton.Android
                value={`${j}`}
                status={answers[i] === j ? "checked" : "unchecked"}
                color={AppColors.persimmon}
                uncheckedColor={AppColors.ink}
                onPress={() => choose(i, j)}
              />
              <Text style={[AppTypography.bodyLarge, styles.flex]}>{option}</Text>
            </Pressable>
          ))}
          <View style={styles.gapM} />
        </View>
      ))}
      <View style={styles.gapXl} />
      <TextField
        testID={RespondPollScreen.commentFieldKey}
        label="¿Por qué elegiste estas opciones? (Opcional)"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={3}
      />
      <View style={styles.gapXxl} />
      <PrimaryButton testID={RespondPollScreen.submitKey} label="Enviar" loading={sending} onPress={send} />
    </ScrollView>
  );
}

RespondPollScreen.key = "RespondPollPage";
RespondPollScreen.optionKey = (question: number, option: number) => `RespondPollPage.q${question}.o${option}`;
RespondPollScreen.commentFieldKey = "RespondPollPage.comment";
RespondPollScreen.submitKey = "RespondPollPage.submit";

const styles = StyleSheet.create({
  container: { padding: AppTokens.gapL },
  flex: { flex: 1 },
  gapS: { height: AppTokens.gapS },
  gapM: { height: AppTokens.gapM },
  gapXl: { height: AppTokens.gapXl },
  gapXxl: { height: AppTokens.gapXl * 2 },
  option: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapS },
});
