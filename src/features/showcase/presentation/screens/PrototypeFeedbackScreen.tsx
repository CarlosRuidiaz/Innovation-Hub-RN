import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { StageChip } from "@/src/core/components/StageChip";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";
import { CommentThreadView } from "../components/CommentThreadView";
import { FeedbackRatingBars } from "../components/FeedbackRatingBars";
import { FeedbackSheet } from "../components/FeedbackSheet";
import { ShowcaseBackButton } from "../components/ShowcaseBackButton";
import { ShowcaseSizes } from "../components/showcaseSizes";
import { usePrototypeDetailViewModel } from "../viewmodels/usePrototypeDetailViewModel";

type Reply = { commentId: string; authorName: string };

// El detalle de un prototipo: `prototype_feedback_page.dart`. Recibe el
// proyecto por los parametros de la ruta, como el `Get.arguments` de Flutter.
// Arriba la retroalimentacion y los comentarios; abajo, fijo, el campo para
// comentar (o responder, si es del equipo).
export default function PrototypeFeedbackScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "PrototypeDetail">>();
  const insets = useSafeAreaInsets();
  const vm = usePrototypeDetailViewModel(route.params.project);
  const { project, isTeamMember, myFeedback, rootComments, repliesFor, refresh, addComment, submitFeedback } = vm;

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Reply | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const startReply = (commentId: string, authorName: string) => {
    setReplyTo({ commentId, authorName });
    inputRef.current?.focus();
  };

  const send = async () => {
    if (text.trim().length === 0 || isSending) return;
    setIsSending(true);
    const ok = await addComment(text, replyTo?.commentId ?? null);
    setIsSending(false);
    if (ok) {
      setText("");
      setReplyTo(null);
      inputRef.current?.blur();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      testID={PrototypeFeedbackScreen.key}
    >
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AppColors.persimmon]}
            tintColor={AppColors.persimmon}
          />
        }
      >
        <View style={[styles.header, { paddingTop: insets.top + AppTokens.gapL }]}>
          <ShowcaseBackButton />
          <Text style={styles.headerTitle}>{project.title}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.chips}>
            <StageChip stage="prototype" />
            {project.tags.map((tag) => (
              <Pill key={tag} label={tag} background={AppColors.card} />
            ))}
          </View>
          {project.description.length > 0 ? <Text style={styles.description}>{project.description}</Text> : null}
          {project.problem.length > 0 ? (
            <View style={styles.problem}>
              <Text style={styles.problemTitle}>Problema a resolver</Text>
              <Text style={styles.problemText}>{project.problem}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />
          <Text style={styles.section}>RETROALIMENTACIÓN</Text>
          <FeedbackRatingBars summary={vm.feedbackSummary} />
          {!isTeamMember ? (
            <PrimaryButton
              label={myFeedback ? "Editar mi retroalimentación" : "Dar retroalimentación"}
              icon="star-outline"
              onPress={() => setSheetOpen(true)}
              testID={PrototypeKeys.giveFeedback}
              style={styles.feedbackButton}
            />
          ) : null}

          <View style={[styles.divider, styles.commentsDivider]} />
          <Text style={styles.section}>COMENTARIOS</Text>
          {rootComments.length === 0 ? (
            <Text style={styles.noComments}>Aún no hay comentarios. ¡Sé el primero en comentar!</Text>
          ) : (
            rootComments.map((comment, index) => (
              <CommentThreadView
                key={comment.id ?? `comentario-${index}`}
                comment={comment}
                replies={repliesFor(comment.id ?? "")}
                canReply={isTeamMember}
                onReplyPress={() => startReply(comment.id ?? "", comment.authorName)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: AppTokens.gapM + insets.bottom }]}>
        {replyTo ? (
          <View style={styles.replyRow}>
            <Text style={styles.replyText}>Respondiendo a {replyTo.authorName}</Text>
            <Pressable
              testID={PrototypeKeys.cancelReply}
              accessibilityRole="button"
              accessibilityLabel="Cancelar respuesta"
              hitSlop={AppTokens.gapS}
              onPress={() => setReplyTo(null)}
            >
              <MaterialIcons name="close" size={ShowcaseSizes.closeIconSize} color={AppColors.secondary} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <TextInput
              ref={inputRef}
              testID={PrototypeKeys.commentField}
              value={text}
              onChangeText={setText}
              placeholder="Escribe un comentario..."
              placeholderTextColor={AppColors.secondary}
              multiline
              style={styles.input}
            />
          </View>
          <PaperCard
            onPress={isSending ? undefined : send}
            padding={AppTokens.gapS}
            margin={styles.sendMargin}
            testID={PrototypeKeys.send}
            accessibilityLabel="Enviar comentario"
          >
            {isSending ? (
              <View style={styles.sendIcon}>
                <ActivityIndicator size="small" color={AppColors.persimmon} />
              </View>
            ) : (
              <MaterialIcons name="arrow-forward" size={AppTokens.iconSize} color={AppColors.persimmon} />
            )}
          </PaperCard>
        </View>
      </View>

      {sheetOpen ? (
        <FeedbackSheet existingFeedback={myFeedback} onSubmit={submitFeedback} onDismiss={() => setSheetOpen(false)} />
      ) : null}
    </KeyboardAvoidingView>
  );
}

PrototypeFeedbackScreen.key = "PrototypeFeedbackPage";

export const PrototypeKeys = {
  giveFeedback: "ButtonGiveFeedback",
  commentField: "TextFieldComment",
  send: "ButtonSendComment",
  cancelReply: "ButtonCancelReply",
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.paper },
  scroll: { flex: 1 },
  header: {
    backgroundColor: AppColors.petrol,
    paddingHorizontal: AppTokens.gapL,
    paddingBottom: AppTokens.gapXl,
    gap: AppTokens.gapL,
  },
  headerTitle: { ...AppTypography.headlineMedium, color: AppColors.white },
  body: { padding: AppTokens.gapL },
  chips: { flexDirection: "row", flexWrap: "wrap", columnGap: AppTokens.gapS, rowGap: AppTokens.gapXs },
  description: { ...AppTypography.bodyLarge, marginTop: AppTokens.gapM },
  problem: { marginTop: AppTokens.gapM },
  problemTitle: AppTypography.titleMedium,
  problemText: { ...AppTypography.bodyMedium, color: AppColors.secondary, marginTop: AppTokens.gapXs },
  divider: { height: AppTokens.borderWidth, backgroundColor: AppColors.ink, marginTop: AppTokens.gapL },
  commentsDivider: { marginTop: AppTokens.gapXl },
  section: {
    ...AppTypography.labelLarge,
    fontFamily: AppFonts.bodyBold,
    color: AppColors.secondary,
    letterSpacing: ShowcaseSizes.sectionLetterSpacing,
    marginTop: AppTokens.gapL,
    marginBottom: AppTokens.gapM,
  },
  feedbackButton: { marginTop: AppTokens.gapXs },
  noComments: {
    ...AppTypography.bodyMedium,
    color: AppColors.secondary,
    textAlign: "center",
    paddingVertical: AppTokens.gapL,
  },
  inputBar: {
    backgroundColor: AppColors.card,
    borderTopWidth: AppTokens.borderWidth,
    borderTopColor: AppColors.ink,
    paddingHorizontal: AppTokens.gapL,
    paddingTop: AppTokens.gapS,
  },
  replyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppTokens.gapXs,
  },
  replyText: { ...AppTypography.bodySmall, fontFamily: AppFonts.bodySemiBold, color: AppColors.persimmon },
  inputRow: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapS },
  inputBox: {
    flex: 1,
    backgroundColor: AppColors.paper,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    paddingHorizontal: AppTokens.gapM,
  },
  input: { ...AppTypography.field, color: AppColors.ink, paddingVertical: AppTokens.gapS },
  sendMargin: { marginLeft: 0, marginRight: AppTokens.shadowOffset, marginBottom: AppTokens.shadowOffset },
  sendIcon: { width: AppTokens.iconSize, height: AppTokens.iconSize, alignItems: "center", justifyContent: "center" },
});
