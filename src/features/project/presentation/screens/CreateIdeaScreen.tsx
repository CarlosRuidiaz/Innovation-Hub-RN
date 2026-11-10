import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { stageColorOf, stageLabelOf } from "@/src/core/components/StageChip";
import { TextField } from "@/src/core/components/TextField";
import { skills as skillsCatalog, tags as tagsCatalog } from "@/src/core/catalogs";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { errorMessage } from "@/src/core/roble/errorMessage";
import { useProfile } from "@/src/features/profile/presentation/context/ProfileContext";
import { newProject } from "@/src/features/project/domain/entities/Project";
import { PROJECT_STAGES, ProjectStage } from "@/src/features/project/domain/entities/ProjectStage";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

const REQUIRED_FIELDS = 6;
// El lider ya es uno: el equipo minimo es de dos.
const MIN_MEMBERS = 2;

// Pantalla 10: crear una idea de proyecto. Reemplaza a `create_idea_page.dart`.
//
// El programa y el lider salen del perfil de la sesion, como en Flutter.
export default function CreateIdeaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useProfile();
  const { createProject } = useProjects();
  const snackbar = useSnackbar();

  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null);
  const [maxMembers, setMaxMembers] = useState(MIN_MEMBERS);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Mientras la peticion esta en vuelo el boton se apaga: un segundo toque con
  // la red lenta crearia la misma idea dos veces.
  const [publishing, setPublishing] = useState(false);

  const completed =
    (title.trim() ? 1 : 0) +
    (problem.trim() ? 1 : 0) +
    (description.trim() ? 1 : 0) +
    (selectedStage != null ? 1 : 0) +
    (profile?.academicProgram != null ? 1 : 0) +
    (skillsWanted.length > 0 ? 1 : 0);
  // Sin un id de perfil la idea naceria sin lider.
  const hasValidLeader = !!profile?.id;
  const canPublish = completed === REQUIRED_FIELDS && hasValidLeader;

  const toggle = (setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) =>
    setList((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const notify = (message: string) => snackbar(message, { title: "Publicar idea" });

  async function publish() {
    if (!canPublish || publishing || selectedStage == null) return;
    if (!profile?.id) {
      notify("No encontramos tu perfil. Vuelve a entrar e inténtalo de nuevo.");
      return;
    }
    setPublishing(true);
    try {
      const created = await createProject(
        newProject({
          title: title.trim(),
          problem: problem.trim(),
          description: description.trim(),
          stage: selectedStage,
          academicProgram: profile.academicProgram,
          currentMembers: 1,
          maxMembers,
          skillsWanted: [...skillsWanted],
          tags: [...selectedTags],
          leaderId: profile.id,
        }),
      );
      // `Get.offAndToNamed` de Flutter: la idea publicada reemplaza al formulario.
      navigation.replace("IdeaPublished", { project: created });
    } catch (e) {
      // Se queda en el formulario, con lo escrito, para poder reintentar.
      notify(errorMessage(e));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <View testID={CreateIdeaScreen.key} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <PaperCard margin={styles.noMargin} padding={AppTokens.gapM}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {completed} de {REQUIRED_FIELDS} campos obligatorios
            </Text>
            <View style={styles.progressRing}>
              <Text style={styles.progressFraction}>
                {completed}/{REQUIRED_FIELDS}
              </Text>
            </View>
          </View>
        </PaperCard>

        <Text style={[styles.sectionHeader, styles.sectionGap]}>01 · Lo esencial</Text>
        <View style={styles.fields}>
          <TextField
            testID={CreateIdeaScreen.titleFieldKey}
            label="Título del proyecto"
            placeholder="Ej: App de movilidad sostenible para el campus"
            value={title}
            onChangeText={setTitle}
          />
          <TextField
            testID={CreateIdeaScreen.problemFieldKey}
            label="Problema a resolver"
            placeholder="¿Qué situación quieres mejorar o resolver?"
            value={problem}
            onChangeText={setProblem}
            multiline
            numberOfLines={3}
          />
          <TextField
            testID={CreateIdeaScreen.descriptionFieldKey}
            label="Descripción"
            placeholder="Cuenta cómo funcionaría y qué ya tienes hecho."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <Text style={[styles.sectionHeader, styles.sectionGap]}>02 · El equipo que buscas</Text>
        <ChipGroup label="Habilidades requeridas">
          {skillsCatalog.map((skill) => (
            <SelectableChip
              key={skill}
              testID={`ChipIdeaSkill-${skill}`}
              label={skill}
              selected={skillsWanted.includes(skill)}
              selectedColor={AppColors.persimmon}
              onPress={() => toggle(setSkillsWanted, skill)}
            />
          ))}
        </ChipGroup>

        <View style={styles.stepperRow}>
          <Text style={styles.label}>Personas en el equipo</Text>
          <View testID={CreateIdeaScreen.maxMembersFieldKey} style={styles.stepper}>
            <Pressable
              testID={`${CreateIdeaScreen.maxMembersFieldKey}-remove`}
              accessibilityRole="button"
              accessibilityLabel="Menos personas"
              disabled={maxMembers <= MIN_MEMBERS}
              onPress={() => setMaxMembers((m) => m - 1)}
              style={styles.stepButton}
            >
              <MaterialIcons name="remove" size={AppTokens.iconSize} color={maxMembers <= MIN_MEMBERS ? AppColors.disabledText : AppColors.ink} />
            </Pressable>
            <Text style={styles.stepperValue}>{maxMembers}</Text>
            <Pressable
              testID={`${CreateIdeaScreen.maxMembersFieldKey}-add`}
              accessibilityRole="button"
              accessibilityLabel="Más personas"
              onPress={() => setMaxMembers((m) => m + 1)}
              style={styles.stepButton}
            >
              <MaterialIcons name="add" size={AppTokens.iconSize} color={AppColors.ink} />
            </Pressable>
          </View>
        </View>

        {/* Seleccion unica: tocar otra reemplaza la marcada. */}
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

        <Text style={[styles.sectionHeader, styles.sectionGap]}>03 · Dale contexto · opcional</Text>
        <ChipGroup label="Tags del proyecto">
          {tagsCatalog.map((tag) => (
            <SelectableChip
              key={tag}
              testID={`ChipIdeaTag-${tag}`}
              label={tag}
              selected={selectedTags.includes(tag)}
              selectedColor={AppColors.petrol}
              onPress={() => toggle(setSelectedTags, tag)}
            />
          ))}
        </ChipGroup>

        {/* Las imagenes todavia no se suben, como en Flutter. */}
        <View style={styles.dropzone}>
          <MaterialIcons name="cloud-upload" size={AppTokens.emptyIconSize} color={AppColors.secondary} />
          <Text style={styles.dropzoneText}>Arrastra imágenes o toca para subir</Text>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.flex}>
            {/* Como en Flutter, todavia no guarda nada. */}
            <SecondaryButton label="Guardar borrador" onPress={() => {}} />
          </View>
          <View style={styles.flex}>
            <PrimaryButton
              testID={CreateIdeaScreen.publishButtonKey}
              label={publishing ? "Publicando..." : "Publicar"}
              onPress={canPublish && !publishing ? publish : undefined}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Pildora que se marca al tocarla: el `_selectableChip` de Flutter.
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
    <Pressable testID={testID} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}>
      <Pill label={label} background={selected ? selectedColor : AppColors.card} />
    </Pressable>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.chipGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

// Las `Key` de Flutter.
CreateIdeaScreen.key = "CreateIdeaPage";
CreateIdeaScreen.titleFieldKey = "TextFormFieldIdeaTitle";
CreateIdeaScreen.problemFieldKey = "TextFormFieldIdeaProblem";
CreateIdeaScreen.descriptionFieldKey = "TextFormFieldIdeaDescription";
CreateIdeaScreen.maxMembersFieldKey = "FieldIdeaMaxMembers";
CreateIdeaScreen.publishButtonKey = "ButtonIdeaPublish";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.paper },
  flex: { flex: 1 },
  scroll: { padding: AppTokens.gapXl },
  noMargin: { margin: 0, marginRight: AppTokens.shadowOffset, marginBottom: AppTokens.shadowOffset },
  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: AppTokens.gapM },
  progressText: { ...AppTypography.titleMedium, flex: 1 },
  progressRing: {
    width: AppTokens.typeTileSize,
    height: AppTokens.typeTileSize,
    borderRadius: AppTokens.pillRadius,
    borderWidth: AppTokens.navIndicatorHeight,
    borderColor: AppColors.persimmon,
    alignItems: "center",
    justifyContent: "center",
  },
  progressFraction: { ...AppTypography.bodySmall, color: AppColors.persimmon },
  sectionHeader: { ...AppTypography.titleMedium, marginBottom: AppTokens.gapM },
  sectionGap: { marginTop: AppTokens.gapXl },
  fields: { gap: AppTokens.gapM },
  chipGroup: { marginBottom: AppTokens.gapL },
  label: { ...AppTypography.bodyLarge, marginBottom: AppTokens.gapS },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: AppTokens.gapL },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    backgroundColor: AppColors.card,
  },
  stepButton: { padding: AppTokens.gapS },
  stepperValue: { ...AppTypography.titleMedium },
  dropzone: {
    alignItems: "center",
    gap: AppTokens.gapS,
    padding: AppTokens.gapXl,
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    marginBottom: AppTokens.gapXl * 2,
  },
  dropzoneText: { ...AppTypography.bodyMedium, color: AppColors.secondary, textAlign: "center" },
  buttonRow: { flexDirection: "row", gap: AppTokens.gapM },
});
