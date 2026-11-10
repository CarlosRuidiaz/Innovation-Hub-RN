import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native";

import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useNavigation } from "@react-navigation/native";

// La fila de "Explorar proyectos": campo de busqueda + boton que abre filtros.
// Reemplaza a `explore_search_row.dart`.
//
// No filtra nada por su cuenta: escribe la busqueda en el contexto, que es
// quien deriva `allVisibleProjects`.
export function ExploreSearchRow() {
  const { searchQuery, setSearchQuery, activeFilterCount } = useProjects();
  const navigation = useNavigation();
  const inputRef = useRef<TextInput>(null);

  // Sincroniza el campo si el contexto limpia la busqueda (por ejemplo,
  // "Limpiar filtros"), igual que la suscripcion de Flutter.
  useEffect(() => {
    if (inputRef.current && searchQuery === "") {
      inputRef.current.clear();
    }
  }, [searchQuery]);

  return (
    <View style={styles.row}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={AppTokens.iconSize} color={AppColors.secondary} style={styles.icon} />
        <TextInput
          ref={inputRef}
          testID="TextFieldSearch"
          style={styles.input}
          placeholder="Buscar proyectos..."
          placeholderTextColor={AppColors.secondary}
          defaultValue={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity
        testID="ButtonFilters"
        style={styles.filtersButton}
        onPress={() => navigation.navigate("ProjectFilters" as never)}
        accessibilityRole="button"
      >
        <MaterialIcons name="tune" size={AppTokens.iconSizeSmall} color={AppColors.ink} />
        <Text style={styles.filtersLabel}>
          {activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : "Filtros"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: AppTokens.gapL,
    paddingTop: AppTokens.gapM,
    paddingBottom: AppTokens.gapS,
    gap: AppTokens.gapM,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    paddingHorizontal: AppTokens.gapS,
  },
  icon: { marginRight: AppTokens.gapXs },
  input: {
    flex: 1,
    paddingVertical: AppTokens.fieldPadding - 4,
    ...AppTypography.bodyMedium,
    color: AppColors.ink,
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTokens.gapXs,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    paddingHorizontal: AppTokens.gapM,
    paddingVertical: AppTokens.gapS,
    backgroundColor: AppColors.card,
  },
  filtersLabel: { ...AppTypography.labelLarge },
});
