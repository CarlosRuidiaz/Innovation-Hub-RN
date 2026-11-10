import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { Pill } from "@/src/core/components/Pill";
import { TextField } from "@/src/core/components/TextField";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { Profile } from "@/src/features/profile/domain/entities/Profile";
import { Project } from "@/src/features/project/domain/entities/Project";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";
import { Application, newApplication } from "../../domain/entities/Application";

type Props = {
  visible: boolean;
  project: Project;
  profile: Profile;
  onDismiss: () => void;
  onSubmit: (application: Application) => Promise<Application | null>;
};

// Kora (07K): la hoja para postularse, sobre la hoja compartida. Las
// habilidades que busca el proyecto, con las del perfil ya marcadas, y un
// mensaje opcional para el lider. La hoja compartida sube con el teclado.
const MESSAGE_MAX = 280;

export function ApplySheet({ visible, project, profile, onDismiss, onSubmit }: Props) {
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
    <BottomSheet visible={visible} onDismiss={onDismiss} testID={ApplySheet.key}>
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
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                testID={`SkillChip_${skill}`}
              >
                <Pill label={isSelected ? `✓ ${skill}` : skill} background={isSelected ? AppColors.ink : AppColors.card} />
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
        <TextField
          testID={ApplySheet.messageFieldKey}
          label=""
          placeholder="Cuéntale al líder qué te motiva y en qué te gustaría trabajar."
          multiline
          numberOfLines={4}
          maxLength={MESSAGE_MAX}
          value={message}
          onChangeText={setMessage}
        />
      </View>

      <View style={styles.buttonRow}>
        <View style={styles.buttonCol}>
          <SecondaryButton testID={ApplySheet.cancelButtonKey} label="Cancelar" onPress={onDismiss} />
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
    </BottomSheet>
  );
}

ApplySheet.key = "ApplySheet";
ApplySheet.titleKey = "ApplySheetTitle";
ApplySheet.messageFieldKey = "ApplySheetMessageField";
ApplySheet.submitButtonKey = "ButtonSendApplication";
ApplySheet.cancelButtonKey = "ButtonCancelApplication";

const styles = StyleSheet.create({
  header: { gap: AppTokens.gapXs, marginBottom: AppTokens.gapS },
  title: AppTypography.headlineMedium,
  projectName: { ...AppTypography.bodyMedium, color: AppColors.secondary },
  section: { gap: AppTokens.gapS, marginBottom: AppTokens.gapM },
  sectionTitle: { ...AppTypography.bodySmall, fontFamily: AppFonts.bodyBold, color: AppColors.ink },
  helperText: AppTypography.bodySmall,
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
  labelRow: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapS },
  buttonRow: { flexDirection: "row", gap: AppTokens.gapM },
  buttonCol: { flex: 1 },
});
