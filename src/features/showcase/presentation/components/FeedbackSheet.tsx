import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton } from "@/src/core/components/Buttons";
import { TextField } from "@/src/core/components/TextField";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";
import { ProjectFeedback } from "../../domain/entities/ProjectFeedback";
import { FeedbackScores } from "../viewmodels/usePrototypeDetailViewModel";
import { ShowcaseSizes } from "./showcaseSizes";

type Criterion = "usability" | "innovation" | "visualDesign" | "feasibility";

const CRITERIA: { key: Criterion; label: string }[] = [
  { key: "usability", label: "Usabilidad" },
  { key: "innovation", label: "Innovación" },
  { key: "visualDesign", label: "Diseño visual" },
  { key: "feasibility", label: "Factibilidad técnica" },
];

type Props = {
  existingFeedback: ProjectFeedback | null;
  onSubmit: (scores: FeedbackScores) => Promise<unknown>;
  onDismiss: () => void;
};

// La hoja para calificar un prototipo del 1 al 5 en los cuatro criterios:
// `feedback_bottom_sheet.dart`, sobre la hoja compartida. Arranca con lo que el
// estudiante ya habia dejado, o con 5 en todo. Se monta al abrirla, asi que
// cada vez parte de la retroalimentacion guardada.
export function FeedbackSheet({ existingFeedback, onSubmit, onDismiss }: Props) {
  const [scores, setScores] = useState<Record<Criterion, number>>({
    usability: existingFeedback?.usability ?? 5,
    innovation: existingFeedback?.innovation ?? 5,
    visualDesign: existingFeedback?.visualDesign ?? 5,
    feasibility: existingFeedback?.feasibility ?? 5,
  });
  const [comment, setComment] = useState(existingFeedback?.comment ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    try {
      const trimmed = comment.trim();
      await onSubmit({ ...scores, comment: trimmed.length > 0 ? trimmed : null });
      // Como en Flutter: guardada o no, la hoja se cierra.
      onDismiss();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet visible onDismiss={onDismiss} testID={FeedbackSheetKeys.sheet}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{existingFeedback ? "Editar retroalimentación" : "Dar retroalimentación"}</Text>
        <Pressable
          testID={FeedbackSheetKeys.close}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          hitSlop={AppTokens.gapS}
          onPress={onDismiss}
        >
          <MaterialIcons name="close" size={AppTokens.iconSize} color={AppColors.ink} />
        </Pressable>
      </View>
      <Text style={styles.subtitle}>
        Califica el prototipo en cada dimensión (1 a 5) y comparte tus sugerencias.
      </Text>
      <View style={styles.selectors}>
        {CRITERIA.map(({ key, label }) => (
          <ScoreSelector
            key={key}
            criterion={key}
            label={label}
            current={scores[key]}
            onSelect={(value) => setScores((prev) => ({ ...prev, [key]: value }))}
          />
        ))}
      </View>
      <Text style={styles.commentLabel}>Comentario u observaciones (opcional)</Text>
      <TextField
        label=""
        placeholder="¿Qué mejorarías de este prototipo?"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={3}
        testID={FeedbackSheetKeys.comment}
      />
      <PrimaryButton
        label="Guardar"
        onPress={save}
        loading={isSaving}
        testID={FeedbackSheetKeys.save}
        style={styles.save}
      />
    </BottomSheet>
  );
}

export const FeedbackSheetKeys = {
  sheet: "FeedbackBottomSheet",
  close: "ButtonFeedbackClose",
  comment: "TextFieldFeedbackComment",
  save: "ButtonFeedbackSave",
  score: (criterion: Criterion, score: number) => `FeedbackScore_${criterion}_${score}`,
};

function ScoreSelector({
  criterion,
  label,
  current,
  onSelect,
}: {
  criterion: Criterion;
  label: string;
  current: number;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.selector}>
      <View style={styles.selectorHeader}>
        <Text style={styles.selectorLabel}>{label}</Text>
        <Text style={styles.selectorValue}>{current} de 5</Text>
      </View>
      <View style={styles.cells}>
        {[1, 2, 3, 4, 5].map((score) => {
          const selected = score <= current;
          return (
            <Pressable
              key={score}
              testID={FeedbackSheetKeys.score(criterion, score)}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${score} de 5`}
              accessibilityState={{ selected }}
              onPress={() => onSelect(score)}
              style={[styles.cell, selected ? styles.cellSelected : null]}
            >
              <Text style={[styles.cellText, selected ? styles.cellTextSelected : null]}>{score}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: AppTypography.titleLarge,
  subtitle: AppTypography.bodySmall,
  selectors: { marginTop: AppTokens.gapS },
  selector: { marginBottom: AppTokens.gapM },
  selectorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  selectorLabel: { ...AppTypography.bodyMedium, fontFamily: AppFonts.bodyBold },
  selectorValue: { ...AppTypography.bodySmall, fontFamily: AppFonts.bodySemiBold, color: AppColors.persimmon },
  cells: { flexDirection: "row", gap: AppTokens.gapXs, marginTop: AppTokens.gapS },
  cell: {
    flex: 1,
    height: ShowcaseSizes.scoreCellHeight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
  },
  cellSelected: { backgroundColor: AppColors.persimmon },
  cellText: { ...AppTypography.bodyMedium, fontFamily: AppFonts.bodyBold },
  cellTextSelected: { color: AppColors.white },
  commentLabel: { ...AppTypography.bodyMedium, fontFamily: AppFonts.bodyBold, marginTop: AppTokens.gapM },
  save: { marginTop: AppTokens.gapL },
});
