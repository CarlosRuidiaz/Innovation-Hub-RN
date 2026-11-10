import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { TextField } from "@/src/core/components/TextField";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { SelectablePill } from "../components/SelectablePill";
import { useWorkspaceViewModel } from "../viewmodels/useWorkspaceViewModel";

const dateOf = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

// Publicar un avance: `publish_update_page.dart`. Titulo, descripcion, un
// enlace de video opcional y, tambien opcional, el hito que este avance cumple.
//
// En Flutter compartia el controlador con el espacio de trabajo. Aqui abre el
// suyo con el mismo proyecto (para saber quien publica y que hitos quedan), y
// el espacio de trabajo vuelve a pedir sus datos al volver.
export default function PublishUpdateScreen() {
  const { project } = useRoute<RouteProp<RootStackParamList, "PublishUpdate">>().params;
  const navigation = useNavigation();
  const vm = useWorkspaceViewModel();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState("");
  const [milestoneId, setMilestoneId] = useState<string | null>(null);
  // Un toque mientras se publica no publica dos veces.
  const publishing = useRef(false);

  const { open } = vm;
  useEffect(() => {
    open(project);
  }, [open, project]);

  const publish = async () => {
    const t = title.trim();
    const d = description.trim();
    if (t.length === 0 || d.length === 0 || publishing.current) return;

    const v = video.trim();
    publishing.current = true;
    try {
      await vm.publishUpdate({ title: t, description: d, videoUrl: v.length === 0 ? null : v, milestoneId });
    } catch {
      // Como en Flutter: si falla, la pantalla se queda como esta.
      return;
    } finally {
      publishing.current = false;
    }
    // Vuelve a la pestaña de avances, que es donde estaba el boton.
    navigation.goBack();
  };

  const pending = vm.pendingMilestones;

  return (
    <ScrollView testID={PublishUpdateScreen.key} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={[AppTypography.bodySmall, styles.project]}>{project.title}</Text>
      <TextField testID={PublishUpdateScreen.titleFieldKey} label="Título" value={title} onChangeText={setTitle} />
      <View style={styles.gapM} />
      <TextField
        testID={PublishUpdateScreen.descriptionFieldKey}
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <View style={styles.gapM} />
      <TextField
        testID={PublishUpdateScreen.videoFieldKey}
        label="Enlace de video (opcional)"
        value={video}
        onChangeText={setVideo}
        autoCapitalize="none"
        keyboardType="url"
      />
      <View style={styles.gapXl} />
      <Text style={AppTypography.titleMedium}>¿Este avance cumple un hito?</Text>
      <View style={styles.gapS} />
      {!vm.hasData ? (
        <ActivityIndicator style={styles.loading} color={AppColors.persimmon} />
      ) : pending.length === 0 ? (
        <Text style={AppTypography.bodySmall}>No hay hitos pendientes por cumplir.</Text>
      ) : (
        <View style={styles.wrap}>
          <SelectablePill
            testID={PublishUpdateScreen.noMilestoneKey}
            label="Ninguno"
            selected={milestoneId == null}
            onPress={() => setMilestoneId(null)}
          />
          {pending.map((m) => (
            <SelectablePill
              key={m.id ?? m.title}
              testID={PublishUpdateScreen.milestoneKey(m.id ?? "")}
              label={`${m.title} · ${dateOf(m.dueDate)}`}
              selected={milestoneId != null && milestoneId === m.id}
              onPress={() => setMilestoneId(m.id)}
            />
          ))}
        </View>
      )}
      <View style={styles.gapXl} />
      {/* Apagado mientras no se sabe quien publica: sin eso el avance no se guardaria. */}
      <PrimaryButton
        testID={PublishUpdateScreen.submitKey}
        label="Publicar avance"
        disabled={!vm.hasData}
        onPress={publish}
      />
    </ScrollView>
  );
}

PublishUpdateScreen.key = "PublishUpdatePage";
PublishUpdateScreen.titleFieldKey = "PublishUpdatePage.title";
PublishUpdateScreen.descriptionFieldKey = "PublishUpdatePage.description";
PublishUpdateScreen.videoFieldKey = "PublishUpdatePage.video";
PublishUpdateScreen.noMilestoneKey = "PublishUpdatePage.milestone.none";
PublishUpdateScreen.milestoneKey = (id: string) => `PublishUpdatePage.milestone.${id}`;
PublishUpdateScreen.submitKey = "PublishUpdatePage.submit";

const styles = StyleSheet.create({
  container: { padding: AppTokens.gapL },
  project: { marginBottom: AppTokens.gapL },
  gapS: { height: AppTokens.gapS },
  gapM: { height: AppTokens.gapM },
  gapXl: { height: AppTokens.gapXl },
  loading: { alignSelf: "flex-start" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
});
