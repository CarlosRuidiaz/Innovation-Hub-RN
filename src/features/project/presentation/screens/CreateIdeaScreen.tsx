import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { TextField } from "@/src/core/components/TextField";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { StageChip, stageLabelOf, stageColorOf } from "@/src/core/components/StageChip";
import { skills as skillsCatalog, tags as tagsCatalog } from "@/src/core/catalogs";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { newProject } from "@/src/features/project/domain/entities/Project";
import { PROJECT_STAGES, ProjectStage } from "@/src/features/project/domain/entities/ProjectStage";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { errorMessage } from "@/src/core/roble/errorMessage";

// Pantalla 10: crear una nueva idea de proyecto.
// Reemplaza a `create_idea_page.dart`.
export default function CreateIdeaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useSession();
  const { createProject } = useProjects();
  const snackbar = useSnackbar();

  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null);
  const [maxMembers, setMaxMembers] = useState(2);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  // El programa academico y el id del lider vienen del usuario de sesion.
  const extra = user ? (user as unknown as Record<string, unknown> & { extra?: unknown }).extra : null;
  const academicProgram: string =
    extra && typeof extra === "object" && typeof (extra as Record<string, unknown>).academicProgram === "string"
      ? (extra as Record<string, string>).academicProgram
      : "";
  const leaderId = user?.userId ?? "";

  // Campos obligatorios: titulo, problema, descripcion, etapa, habilidades.
  // El programa viene del perfil (siempre lo hay si el perfil esta completo).
  const camposCompletos =
    (title.trim() ? 1 : 0) +
    (problem.trim() ? 1 : 0) +
    (description.trim() ? 1 : 0) +
    (selectedStage != null ? 1 : 0) +
    (academicProgram ? 1 : 0) +
    (skillsWanted.length > 0 ? 1 : 0);

  const TOTAL_REQUERIDOS = 6;
  const canPublish = camposCompletos === TOTAL_REQUERIDOS && leaderId.length > 0 && !publishing;

  function toggleSkill(skill: string) {
    setSkillsWanted((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handlePublish() {
    if (!canPublish) return;
    setPublishing(true);
    try {
      const project = newProject({
        title: title.trim(),
        problem: problem.trim(),
        description: description.trim(),
        stage: selectedStage!,
        academicProgram,
        currentMembers: 1,
        maxMembers,
        skillsWanted: [...skillsWanted],
        tags: [...selectedTags],
        leaderId,
      });
      const created = await createProject(project);
      // `offAndToNamed` de Flutter: reemplaza la pila hasta la raiz.
      navigation.replace("IdeaPublished", { project: created });
    } catch (e) {
      snackbar(errorMessage(e));
    } finally {
      setPublishing(false);
    }
  }

  function SelectableChip({
    label,
    selected,
    selectedColor,
    onPress,
    testID,
  }: {
    label: string;
    selected: boolean;
    selectedColor: string;
    onPress: () => void;
    testID?: string;
  }) {
    return (
      <TouchableOpacity testID={testID} onPress={onPress} accessibilityRole="checkbox">
        <Pill label={label} background={selected ? selectedColor : AppColors.card} />
      </TouchableOpacity>
    );
  }

  function ChipGroup({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) {
    return (
      <View style={styles.chipGroup}>
        <Text style={styles.chipGroupLabel}>{label}</Text>
        <View style={styles.chips}>{children}</View>
      </View>
    );
  }

  return (
    <View testID={CreateIdeaScreen.key} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Cabecera de progreso */}
        <PaperCard>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {camposCompletos} de {TOTAL_REQUERIDOS} campos obligatorios
            </Text>
            <View style={styles.progressRing}>
              <Text style={styles.progressFraction}>
                {camposCompletos}/{TOTAL_REQUERIDOS}
              </Text>
            </View>
          </View>
        </PaperCard>

        <View style={styles.gap} />

        {/* Sección 01: Lo esencial */}
        <Text style={styles.sectionHeader}>01 · Lo esencial</Text>
        <View style={styles.gapM} />
        <TextField
          testID="TextFormFieldIdeaTitle"
          label="Título del proyecto"
          placeholder="Ej: App de movilidad sostenible para el campus"
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.gapM} />
        <TextField
          testID="TextFormFieldIdeaProblem"
          label="Problema a resolver"
          placeholder="¿Qué situación quieres mejorar o resolver?"
          value={problem}
          onChangeText={setProblem}
          multiline
          numberOfLines={3}
        />
        <View style={styles.gapM} />
        <TextField
          testID="TextFormFieldIdeaDescription"
          label="Descripción"
          placeholder="Cuenta cómo funcionaría y qué ya tienes hecho."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <View style={styles.gap} />

        {/* Sección 02: El equipo que buscas */}
        <Text style={styles.sectionHeader}>02 · El equipo que buscas</Text>
        <View style={styles.gapM} />

        <ChipGroup label="Habilidades requeridas">
          {skillsCatalog.map((skill) => (
            <SelectableChip
              key={skill}
              testID={`ChipIdeaSkill-${skill}`}
              label={skill}
              selected={skillsWanted.includes(skill)}
              selectedColor={AppColors.persimmon}
              onPress={() => toggleSkill(skill)}
            />
          ))}
        </ChipGroup>

        <View style={styles.gapL} />

        {/* Stepper de personas */}
        <View style={styles.stepperRow} testID="FieldIdeaMaxMembers">
          <Text style={styles.chipGroupLabel}>Personas en el equipo</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => setMaxMembers((m) => Math.max(2, m - 1))}
              disabled={maxMembers <= 2}
              style={styles.stepBtn}
            >
              <Text style={[styles.stepBtnText, maxMembers <= 2 && styles.stepBtnDisabled]}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{maxMembers}</Text>
            <TouchableOpacity onPress={() => setMaxMembers((m) => m + 1)} style={styles.stepBtn}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gapL} />

        {/* Etapa actual */}
        <ChipGroup label="Etapa actual">
          {PROJECT_STAGES.map((stage) => (
            <SelectableChip
              key={stage}
              testID={`ChipIdeaStage-${stage}`}
              label={stageLabelOf(stage)}
              selected={selectedStage === stage}
              selectedColor={stageColorOf(stage)}
              onPress={() => setSelectedStage(stage)}
            />
          ))}
        </ChipGroup>

        <View style={styles.gap} />

        {/* Sección 03: Dale contexto (opcional) */}
        <Text style={styles.sectionHeader}>03 · Dale contexto · opcional</Text>
        <View style={styles.gapM} />

        <ChipGroup label="Tags del proyecto">
          {tagsCatalog.map((tag) => (
            <SelectableChip
              key={tag}
              testID={`ChipIdeaTag-${tag}`}
              label={tag}
              selected={selectedTags.includes(tag)}
              selectedColor={AppColors.petrol}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </ChipGroup>

        <View style={styles.gap} />

        {/* Botones */}
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <SecondaryButton label="Guardar borrador" />
          </View>
          <View style={styles.buttonHalf}>
            <PrimaryButton
              testID="ButtonIdeaPublish"
              label={publishing ? "Publicando..." : "Publicar"}
              onPress={handlePublish}
              disabled={!canPublish}
              loading={publishing}
            />
          </View>
        </View>

        <View style={styles.gap} />
      </ScrollView>
    </View>
  );
}

CreateIdeaScreen.key = "CreateIdeaPage";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.paper },
  scroll: { padding: AppTokens.gapXl },
  gap: { height: AppTokens.gapXl },
  gapM: { height: AppTokens.gapM },
  gapL: { height: AppTokens.gapL },
  sectionHeader: { ...AppTypography.titleMedium, fontFamily: "Archivo_700Bold" },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressText: { ...AppTypography.titleMedium, flex: 1 },
  progressRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: AppColors.persimmon,
    alignItems: "center",
    justifyContent: "center",
  },
  progressFraction: { ...AppTypography.bodySmall, color: AppColors.persimmon },
  chipGroup: { marginBottom: AppTokens.gapS },
  chipGroupLabel: { ...AppTypography.bodyLarge, marginBottom: AppTokens.gapS },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    backgroundColor: AppColors.card,
    overflow: "hidden",
  },
  stepBtn: { padding: AppTokens.gapM },
  stepBtnText: { ...AppTypography.titleMedium, color: AppColors.ink },
  stepBtnDisabled: { color: AppColors.secondary },
  stepperValue: { ...AppTypography.titleMedium, paddingHorizontal: AppTokens.gapM },
  buttonRow: { flexDirection: "row", gap: AppTokens.gapM },
  buttonHalf: { flex: 1 },
});
