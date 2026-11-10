import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Pill } from "@/src/core/components/Pill";
import { PrimaryButton } from "@/src/core/components/Buttons";
import { academicPrograms, skills, tags } from "@/src/core/catalogs";
import { PROJECT_STAGES, ProjectStage } from "@/src/features/project/domain/entities/ProjectStage";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { stageLabelOf, stageColorOf } from "@/src/core/components/StageChip";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useNavigation } from "@react-navigation/native";

// La pantalla de filtros de la cartelera: tres grupos de seleccion multiple.
// Reemplaza a `project_filters_page.dart`.
//
// Trabaja sobre copias locales de la seleccion y solo la vuelca al contexto
// al pulsar "Aplicar": salir con atras deja los filtros como estaban.
export default function ProjectFiltersScreen() {
  const { skillFilters, programFilters, stageFilters, tagFilters, applyFilters } = useProjects();
  const navigation = useNavigation();

  // Copias locales: si se editaran en sitio, el boton de volver no podria
  // deshacer nada.
  const [localSkills, setLocalSkills] = useState<string[]>([...skillFilters]);
  const [localPrograms, setLocalPrograms] = useState<string[]>([...programFilters]);
  const [localStages, setLocalStages] = useState<ProjectStage[]>([...stageFilters]);
  const [localTags, setLocalTags] = useState<string[]>([...tagFilters]);

  function toggleItem<T>(list: T[], setList: (l: T[]) => void, value: T) {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  }

  // Cuantos grupos tienen algo marcado en la seleccion local.
  const seleccionados =
    (localSkills.length > 0 ? 1 : 0) +
    (localPrograms.length > 0 ? 1 : 0) +
    (localStages.length > 0 ? 1 : 0) +
    (localTags.length > 0 ? 1 : 0);

  function handleApply() {
    applyFilters({
      skills: localSkills,
      programs: localPrograms,
      stages: localStages,
      tags: localTags,
    });
    navigation.goBack();
  }

  function FilterPill({
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

  function FilterGroup({
    testID,
    title,
    children,
  }: {
    testID: string;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <View testID={testID} style={styles.group}>
        <Text style={styles.groupTitle}>{title}</Text>
        <View style={styles.chips}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FilterGroup testID="grupo-habilidades" title="Habilidades">
          {skills.map((skill) => (
            <FilterPill
              key={skill}
              label={skill}
              selected={localSkills.includes(skill)}
              selectedColor={AppColors.persimmon}
              onPress={() => toggleItem(localSkills, setLocalSkills, skill)}
            />
          ))}
        </FilterGroup>

        <FilterGroup testID="grupo-programas" title="Programa académico">
          {academicPrograms.map((program) => (
            <FilterPill
              key={program}
              label={program}
              selected={localPrograms.includes(program)}
              selectedColor={AppColors.petrol}
              onPress={() => toggleItem(localPrograms, setLocalPrograms, program)}
            />
          ))}
        </FilterGroup>

        <FilterGroup testID="grupo-etapas" title="Etapa del proyecto">
          {PROJECT_STAGES.map((stage) => (
            <FilterPill
              key={stage}
              label={stageLabelOf(stage)}
              selected={localStages.includes(stage)}
              selectedColor={stageColorOf(stage)}
              onPress={() => toggleItem(localStages, setLocalStages, stage)}
            />
          ))}
        </FilterGroup>

        <FilterGroup testID="grupo-categorias" title="Categoría">
          {tags.map((tag) => (
            <FilterPill
              key={tag}
              label={tag}
              selected={localTags.includes(tag)}
              selectedColor={AppColors.gold}
              onPress={() => toggleItem(localTags, setLocalTags, tag)}
            />
          ))}
        </FilterGroup>
      </ScrollView>

      {/* Pie con el boton "Aplicar" */}
      <View style={styles.footer}>
        <PrimaryButton
          testID="ButtonApplyFilters"
          label={
            seleccionados === 0
              ? "Aplicar filtros"
              : `Aplicar ${seleccionados} ${seleccionados === 1 ? "filtro" : "filtros"}`
          }
          onPress={handleApply}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.paper },
  scroll: { padding: AppTokens.gapL, paddingBottom: 0 },
  group: { marginBottom: AppTokens.gapXl },
  groupTitle: { ...AppTypography.titleMedium, marginBottom: AppTokens.gapM },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: AppTokens.gapS },
  footer: { padding: AppTokens.gapL, borderTopWidth: 0 },
});
