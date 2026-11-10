import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Menu } from "react-native-paper";

import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { DatePickerDialog } from "@/src/core/components/DatePickerDialog";
import { TextField } from "@/src/core/components/TextField";
import { academicPrograms } from "@/src/core/catalogs";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { newPoll } from "../../domain/entities/Poll";
import { usePollViewModel } from "../viewmodels/usePollViewModel";

type QuestionData = { text: string; options: string[] };

const DAY = 24 * 3600_000;
const REQUIRED = "Requerido";
const EVERYONE = "Toda la comunidad";

const newQuestion = (): QuestionData => ({ text: "", options: ["", ""] });

// Crear una encuesta: `create_poll_page.dart`. Titulo, descripcion, fecha de
// cierre, audiencia opcional (un programa del catalogo) y preguntas de opcion
// unica, cada una con dos opciones o mas.
export default function CreatePollScreen() {
  const { project } = useRoute<RouteProp<RootStackParamList, "CreatePoll">>().params;
  const navigation = useNavigation();
  const snackbar = useSnackbar();
  const { currentUser } = useSession();
  const vm = usePollViewModel();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState<Date | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([newQuestion()]);
  const [publishing, setPublishing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [audienceOpen, setAudienceOpen] = useState(false);
  // El rango del calendario: desde hoy hasta dentro de un año.
  const [now] = useState(() => Date.now());
  // Los mensajes de los `validator` de Flutter: aparecen al intentar publicar.
  const [errors, setErrors] = useState<{ title?: string; description?: string; questions: (string | undefined)[] }>({
    questions: [],
  });

  const editQuestion = (i: number, change: (q: QuestionData) => QuestionData) =>
    setQuestions((qs) => qs.map((q, k) => (k === i ? change(q) : q)));
  const addQuestion = () => setQuestions((qs) => [...qs, newQuestion()]);
  const removeQuestion = (i: number) => setQuestions((qs) => qs.filter((_, k) => k !== i));
  const addOption = (i: number) => editQuestion(i, (q) => ({ ...q, options: [...q.options, ""] }));
  const removeOption = (i: number, j: number) =>
    editQuestion(i, (q) => ({ ...q, options: q.options.filter((_, k) => k !== j) }));

  // El `Form.validate()` de Flutter: titulo, descripcion y el texto de cada pregunta.
  const validate = () => {
    const next = {
      title: title.trim().length === 0 ? REQUIRED : undefined,
      description: description.trim().length === 0 ? REQUIRED : undefined,
      questions: questions.map((q) => (q.text.trim().length === 0 ? REQUIRED : undefined)),
    };
    setErrors(next);
    return next.title == null && next.description == null && next.questions.every((e) => e == null);
  };

  const publish = async () => {
    if (!validate()) return;
    if (closesAt == null) {
      snackbar("Debes seleccionar una fecha de cierre", { title: "Error" });
      return;
    }
    for (const q of questions) {
      if (q.options.some((o) => o.trim().length === 0)) {
        snackbar("Todas las opciones deben tener texto", { title: "Error" });
        return;
      }
      if (q.options.length < 2) {
        snackbar("Cada pregunta debe tener al menos 2 opciones", { title: "Error" });
        return;
      }
    }

    setPublishing(true);
    const user = currentUser();
    if (user == null || project.id == null) {
      setPublishing(false);
      return;
    }

    const created = await vm.createPoll(
      newPoll({
        projectId: project.id,
        authorId: user.userId,
        title: title.trim(),
        description: description.trim(),
        closesAt,
        audienceProgram: audience,
        questions: questions.map((q) => ({ text: q.text.trim(), options: q.options.map((o) => o.trim()) })),
      }),
    );
    setPublishing(false);

    if (created != null) {
      navigation.goBack();
    } else {
      snackbar("No se pudo crear la encuesta", { title: "Error" });
    }
  };

  return (
    <ScrollView testID={CreatePollScreen.key} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={AppTypography.titleMedium}>Detalles</Text>
      <View style={styles.gapM} />
      <TextField
        testID={CreatePollScreen.titleFieldKey}
        label="Título"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />
      <View style={styles.gapM} />
      <TextField
        testID={CreatePollScreen.descriptionFieldKey}
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        error={errors.description}
      />
      <View style={styles.gapM} />

      {/* El `ListTile` de la fecha de cierre. */}
      <Pressable
        testID={CreatePollScreen.closesAtKey}
        accessibilityRole="button"
        onPress={() => setPicking(true)}
        style={styles.tile}
      >
        <View style={styles.flex}>
          <Text style={AppTypography.bodyLarge}>Fecha de cierre</Text>
          <Text style={AppTypography.bodySmall}>
            {closesAt == null
              ? "Seleccionar fecha futura"
              : `${closesAt.getDate()}/${closesAt.getMonth() + 1}/${closesAt.getFullYear()}`}
          </Text>
        </View>
        <MaterialIcons name="calendar-today" size={AppTokens.iconSize} color={AppColors.secondary} />
      </Pressable>
      <View style={styles.gapM} />

      {/* El `DropdownButtonFormField` de la audiencia. */}
      <Menu
        visible={audienceOpen}
        onDismiss={() => setAudienceOpen(false)}
        anchorPosition="bottom"
        contentStyle={styles.menu}
        anchor={
          <Pressable
            testID={CreatePollScreen.audienceKey}
            accessibilityRole="button"
            onPress={() => setAudienceOpen(true)}
          >
            <View pointerEvents="none">
              <TextField label="Audiencia (Opcional)" value={audience ?? EVERYONE} onChangeText={() => {}} />
            </View>
            <View pointerEvents="none" style={styles.dropdownIcon}>
              <MaterialIcons name="arrow-drop-down" size={AppTokens.iconSize} color={AppColors.ink} />
            </View>
          </Pressable>
        }
      >
        {[null, ...academicPrograms].map((program) => (
          <Menu.Item
            key={program ?? EVERYONE}
            testID={CreatePollScreen.audienceOptionKey(program)}
            title={program ?? EVERYONE}
            titleStyle={AppTypography.bodyLarge}
            onPress={() => {
              setAudience(program);
              setAudienceOpen(false);
            }}
          />
        ))}
      </Menu>

      <View style={styles.gapXl} />
      <Text style={AppTypography.titleMedium}>Preguntas</Text>
      <View style={styles.gapM} />

      {questions.map((q, i) => (
        <Card key={i} testID={CreatePollScreen.questionKey(i)} style={styles.card}>
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField
                  testID={CreatePollScreen.questionFieldKey(i)}
                  label={`Pregunta ${i + 1}`}
                  value={q.text}
                  onChangeText={(text) => editQuestion(i, (old) => ({ ...old, text }))}
                  error={errors.questions[i]}
                />
              </View>
              {questions.length > 1 ? (
                <Pressable
                  testID={CreatePollScreen.removeQuestionKey(i)}
                  accessibilityRole="button"
                  accessibilityLabel="Eliminar pregunta"
                  onPress={() => removeQuestion(i)}
                  style={styles.iconButton}
                >
                  <MaterialIcons name="delete" size={AppTokens.iconSize} color={AppColors.persimmon} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.gapM} />
            {q.options.map((option, j) => (
              <View key={j} style={[styles.row, styles.option]}>
                <View style={styles.flex}>
                  <TextField
                    testID={CreatePollScreen.optionFieldKey(i, j)}
                    label={`Opción ${j + 1}`}
                    value={option}
                    onChangeText={(text) =>
                      editQuestion(i, (old) => ({ ...old, options: old.options.map((o, k) => (k === j ? text : o)) }))
                    }
                  />
                </View>
                {q.options.length > 2 ? (
                  <Pressable
                    testID={CreatePollScreen.removeOptionKey(i, j)}
                    accessibilityRole="button"
                    accessibilityLabel="Quitar opción"
                    onPress={() => removeOption(i, j)}
                    style={styles.iconButton}
                  >
                    <MaterialIcons name="remove-circle-outline" size={AppTokens.iconSize} color={AppColors.ink} />
                  </Pressable>
                ) : null}
              </View>
            ))}
            <Button
              testID={CreatePollScreen.addOptionKey(i)}
              mode="text"
              style={styles.startAligned}
              icon={({ size, color }) => <MaterialIcons name="add" size={size} color={color} />}
              onPress={() => addOption(i)}
            >
              Añadir opción
            </Button>
          </View>
        </Card>
      ))}

      <SecondaryButton testID={CreatePollScreen.addQuestionKey} icon="add" label="Añadir pregunta" onPress={addQuestion} />
      <View style={styles.gapXxl} />
      <PrimaryButton testID={CreatePollScreen.submitKey} label="Publicar" loading={publishing} onPress={publish} />

      <DatePickerDialog
        visible={picking}
        initialDate={closesAt ?? new Date(now + DAY)}
        firstDate={new Date(now)}
        lastDate={new Date(now + 365 * DAY)}
        onConfirm={(date) => {
          setClosesAt(date);
          setPicking(false);
        }}
        onDismiss={() => setPicking(false)}
      />
    </ScrollView>
  );
}

CreatePollScreen.key = "CreatePollPage";
CreatePollScreen.titleFieldKey = "CreatePollPage.title";
CreatePollScreen.descriptionFieldKey = "CreatePollPage.description";
CreatePollScreen.closesAtKey = "CreatePollPage.closesAt";
CreatePollScreen.audienceKey = "CreatePollPage.audience";
CreatePollScreen.audienceOptionKey = (program: string | null) => `CreatePollPage.audience.${program ?? "all"}`;
CreatePollScreen.questionKey = (i: number) => `CreatePollPage.question.${i}`;
CreatePollScreen.questionFieldKey = (i: number) => `CreatePollPage.question.${i}.text`;
CreatePollScreen.removeQuestionKey = (i: number) => `CreatePollPage.question.${i}.remove`;
CreatePollScreen.optionFieldKey = (i: number, j: number) => `CreatePollPage.question.${i}.option.${j}`;
CreatePollScreen.removeOptionKey = (i: number, j: number) => `CreatePollPage.question.${i}.option.${j}.remove`;
CreatePollScreen.addOptionKey = (i: number) => `CreatePollPage.question.${i}.addOption`;
CreatePollScreen.addQuestionKey = "CreatePollPage.addQuestion";
CreatePollScreen.submitKey = "CreatePollPage.submit";

const styles = StyleSheet.create({
  container: { padding: AppTokens.gapL },
  flex: { flex: 1 },
  gapM: { height: AppTokens.gapM },
  gapXl: { height: AppTokens.gapXl },
  gapXxl: { height: AppTokens.gapXl * 2 },
  tile: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapL, paddingVertical: AppTokens.gapS },
  menu: { backgroundColor: AppColors.card },
  dropdownIcon: {
    position: "absolute",
    right: AppTokens.gapM,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  card: { marginBottom: AppTokens.gapL, backgroundColor: AppColors.card },
  cardBody: { padding: AppTokens.gapM },
  row: { flexDirection: "row", alignItems: "center" },
  option: { marginBottom: AppTokens.gapS },
  iconButton: { padding: AppTokens.gapS },
  startAligned: { alignSelf: "flex-start" },
});
