import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { Pill } from "@/src/core/components/Pill";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { Application, newApplication } from "../../domain/entities/Application";

type Props = {
  visible: boolean;
  project: Project;
  profile: Profile;
  onDismiss: () => void;
  onSubmit: (application: Application) => Promise<Application | null>;
};

export function ApplySheet({ visible, project, profile, onDismiss, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const snackbar = useSnackbar();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Regla: si el proyecto busca habilidades, se muestran esas; si no pide ninguna, se muestran las del perfil.
  const availableSkills = useMemo(() => {
    if (project.skillsWanted.length > 0) {
      return project.skillsWanted;
    }
    return profile.skills;
  }, [project.skillsWanted, profile.skills]);

  // Pre-marcadas: las que coinciden con el perfil (o todas si el proyecto no pedía ninguna).
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    const studentSkillsLower = new Set(profile.skills.map((s) => s.trim().toLowerCase()));
    if (project.skillsWanted.length === 0) {
      return [...profile.skills];
    }
    return project.skillsWanted.filter((s) => studentSkillsLower.has(s.trim().toLowerCase()));
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleSend = async () => {
    if (selectedSkills.length === 0 || submitting) return;

    setSubmitting(true);
    try {
      const app = newApplication({
        projectId: project.id ?? "",
        applicantId: profile.id ?? "",
        applicantName: profile.fullName,
        applicantProgram: profile.academicProgram,
        applicantSemester: profile.semester,
        skillsOffered: selectedSkills,
        message: message.trim() || null,
      });

      const created = await onSubmit(app);
      if (created) {
        if (app.message && !created.message) {
          snackbar("Tu postulación se envió, pero no el mensaje.");
        }
        onDismiss();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      testID={ApplySheet.key}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onDismiss}
          accessibilityLabel="Cerrar"
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, AppTokens.gapL) }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.handleBar} />

            <View style={styles.header}>
              <Text testID={ApplySheet.titleKey} style={styles.title}>
                Postularme
              </Text>
              <Text style={styles.projectName}>{project.title}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>¿CÓMO PUEDES APORTAR?</Text>
              <Text style={styles.helperText}>Marcamos las que coinciden con tu perfil.</Text>

              <View style={styles.skillsWrap}>
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <Pressable
                      key={skill}
                      onPress={() => toggleSkill(skill)}
                      style={[styles.skillChip, isSelected ? styles.skillChipActive : styles.skillChipInactive]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      testID={`SkillChip_${skill}`}
                    >
                      <Text
                        style={[
                          styles.skillChipText,
                          isSelected ? styles.skillChipTextActive : styles.skillChipTextInactive,
                        ]}
                      >
                        {isSelected ? `✓ ${skill}` : skill}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.sectionTitle}>¿POR QUÉ QUIERES UNIRTE?</Text>
                <Pill label="opcional" background={AppColors.card} />
              </View>

              <TextInput
                testID={ApplySheet.messageFieldKey}
                style={styles.textArea}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Cuéntale al líder qué te motiva y en qué te gustaría trabajar."
                placeholderTextColor={AppColors.secondary}
                maxLength={280}
                value={message}
                onChangeText={setMessage}
              />
              <Text style={styles.charCount}>{`${message.length}/280`}</Text>
            </View>

            <View style={styles.buttonRow}>
              <View style={styles.buttonCol}>
                <SecondaryButton
                  testID={ApplySheet.cancelButtonKey}
                  label="Cancelar"
                  onPress={onDismiss}
                />
              </View>
              <View style={styles.buttonCol}>
                <PrimaryButton
                  testID={ApplySheet.submitButtonKey}
                  label="Enviar postulación"
                  disabled={selectedSkills.length === 0 || submitting}
                  loading={submitting}
                  onPress={handleSend}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

ApplySheet.key = "ApplySheet";
ApplySheet.titleKey = "ApplySheetTitle";
ApplySheet.messageFieldKey = "ApplySheetMessageField";
ApplySheet.submitButtonKey = "ButtonSendApplication";
ApplySheet.cancelButtonKey = "ButtonCancelApplication";

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { backgroundColor: AppColors.backdrop },
  sheet: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderBottomWidth: 0,
    borderTopLeftRadius: AppTokens.sheetRadius,
    borderTopRightRadius: AppTokens.sheetRadius,
    paddingHorizontal: AppTokens.gapL,
    paddingTop: AppTokens.gapM,
    maxHeight: "90%",
  },
  scrollContent: { gap: AppTokens.gapL, paddingBottom: AppTokens.gapM },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.secondary,
    alignSelf: "center",
    opacity: 0.4,
  },
  header: { gap: AppTokens.gapXs },
  title: { ...AppTypography.displayLarge, fontSize: 24, textAlign: "left" },
  projectName: { ...AppTypography.bodyMedium, color: AppColors.secondary },
  section: { gap: AppTokens.gapS },
  sectionTitle: {
    ...AppTypography.bodySmall,
    fontWeight: "700",
    color: AppColors.ink,
    letterSpacing: 0.5,
  },
  helperText: { ...AppTypography.bodySmall, color: AppColors.secondary },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: AppTokens.gapS,
  },
  skillChip: {
    paddingHorizontal: AppTokens.pillPaddingH + 2,
    paddingVertical: AppTokens.gapS - 1,
    borderRadius: AppTokens.pillRadius,
    borderWidth: AppTokens.borderWidth,
  },
  skillChipActive: {
    backgroundColor: AppColors.ink,
    borderColor: AppColors.ink,
  },
  skillChipInactive: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
  },
  skillChipText: { ...AppTypography.labelLarge, fontSize: 13 },
  skillChipTextActive: { color: AppColors.white },
  skillChipTextInactive: { color: AppColors.ink },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTokens.gapS,
  },
  textArea: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    padding: AppTokens.gapM,
    ...AppTypography.bodyLarge,
    minHeight: 90,
  },
  charCount: {
    ...AppTypography.bodySmall,
    color: AppColors.secondary,
    textAlign: "right",
  },
  buttonRow: {
    flexDirection: "row",
    gap: AppTokens.gapM,
    marginTop: AppTokens.gapS,
  },
  buttonCol: { flex: 1 },
});
