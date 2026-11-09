import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { TextField } from "@/src/core/components/TextField";
import { academicPrograms, skills as skillCatalog } from "@/src/core/catalogs";
import { useSnackbar } from "@/src/core/feedback/SnackbarProvider";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { ChoiceChip } from "../components/ChoiceChip";
import { MIN_SEMESTER, SemesterStepper } from "../components/SemesterStepper";
import { useSession } from "../context/SessionContext";

const BIO_MAX_LENGTH = 200;

// Paso 2 de 2 del registro: el perfil del estudiante (`complete_profile_page.dart`).
//
// Aqui se crea la cuenta con todo junto, credenciales incluidas: el perfil
// viaja en el `extra`, y `extra` solo se manda al crearla.
//
// Programa y habilidades salen de los catalogos y no de texto libre: si cada
// quien escribe su variante, el emparejamiento con los proyectos se rompe.
export default function CompleteProfileScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, "CompleteProfile">>();
  const session = useSession();
  const snackbar = useSnackbar();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [program, setProgram] = useState<string | null>(null);
  const [semester, setSemester] = useState(MIN_SEMESTER);
  const [bio, setBio] = useState("");
  const [chosenSkills, setChosenSkills] = useState<string[]>([]);

  const profileComplete = program != null && chosenSkills.length > 0;

  const toggleSkill = (skill: string) =>
    setChosenSkills((current) => (current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill]));

  const createAccount = async () => {
    Keyboard.dismiss();
    const problem = name.trim() ? null : "Escribe tu nombre";
    setNameError(problem);
    if (problem || program == null) return;
    const created = await session.signUp(params.email, params.password, {
      name,
      academicProgram: program,
      semester,
      skills: [...chosenSkills],
      bio,
    });
    // Si se creo, la sesion queda abierta y la puerta de sesion cambia sola a
    // la app, como el `Get.until` de Flutter.
    if (!created) snackbar(session.lastError(), { title: "Crear cuenta" });
  };

  return (
    <ScrollView testID={CompleteProfileScreen.key} style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.step}>Paso 2 de 2</Text>
      <Text style={styles.body}>Esto es lo que ven los demás de ti, y con esto te recomendamos proyectos.</Text>

      <View style={styles.name}>
        <TextField
          testID={CompleteProfileScreen.nameFieldKey}
          label="Nombre completo"
          placeholder="Ej: Ana García"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
          error={nameError}
        />
      </View>

      <View testID={CompleteProfileScreen.programFieldKey} style={styles.group}>
        <Text style={styles.groupTitle}>Programa académico</Text>
        <View style={styles.chips}>
          {academicPrograms.map((p) => (
            <ChoiceChip key={p} label={p} selected={program === p} selectedColor={AppColors.petrol} onPress={() => setProgram(p)} />
          ))}
        </View>
      </View>

      <View style={styles.semesterRow}>
        <Text style={[styles.groupTitle, styles.semesterLabel]}>Semestre</Text>
        <SemesterStepper testID={CompleteProfileScreen.semesterFieldKey} value={semester} onChange={setSemester} />
      </View>

      <View style={styles.bio}>
        <TextField
          testID={CompleteProfileScreen.bioFieldKey}
          label="Sobre ti (opcional)"
          placeholder="Una o dos líneas: qué te interesa, qué buscas."
          multiline
          numberOfLines={3}
          maxLength={BIO_MAX_LENGTH}
          value={bio}
          onChangeText={setBio}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Tus habilidades</Text>
        <View style={styles.chips}>
          {skillCatalog.map((s) => (
            <ChoiceChip
              key={s}
              testID={CompleteProfileScreen.skillChipKey(s)}
              label={s}
              selected={chosenSkills.includes(s)}
              selectedColor={AppColors.persimmon}
              onPress={() => toggleSkill(s)}
            />
          ))}
        </View>
      </View>

      {!profileComplete ? (
        <Text style={styles.hint}>
          Elige tu programa y al menos una habilidad: sin eso no podemos mostrarte proyectos que te sirvan.
        </Text>
      ) : null}

      <PrimaryButton
        testID={CompleteProfileScreen.submitButtonKey}
        label={session.isLoading ? "Creando cuenta..." : "Crear cuenta"}
        onPress={session.isLoading || !profileComplete ? undefined : createAccount}
      />
    </ScrollView>
  );
}

CompleteProfileScreen.key = "CompleteProfilePage";
CompleteProfileScreen.nameFieldKey = "TextFormFieldProfileName";
CompleteProfileScreen.programFieldKey = "FieldProfileProgram";
// El "-" y el "+" llevan `-remove` y `-add` detras de esta clave.
CompleteProfileScreen.semesterFieldKey = "FieldProfileSemester";
CompleteProfileScreen.bioFieldKey = "TextFormFieldProfileBio";
CompleteProfileScreen.skillChipKey = (skill: string) => `ChipProfileSkill-${skill}`;
CompleteProfileScreen.submitButtonKey = "ButtonProfileSubmit";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.paper },
  container: { padding: AppTokens.gapL },
  step: { ...AppTypography.bodySmall },
  body: { ...AppTypography.bodyMedium, marginTop: AppTokens.gapXs },
  name: { marginTop: AppTokens.gapXl, marginBottom: AppTokens.gapL },
  group: { marginBottom: AppTokens.gapL },
  groupTitle: { ...AppTypography.bodyLarge, marginBottom: AppTokens.gapS },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
  semesterRow: { flexDirection: "row", alignItems: "center", marginBottom: AppTokens.gapL },
  semesterLabel: { flex: 1, marginBottom: 0 },
  bio: { marginBottom: AppTokens.gapM },
  hint: { ...AppTypography.bodySmall, marginBottom: AppTokens.gapM },
});
