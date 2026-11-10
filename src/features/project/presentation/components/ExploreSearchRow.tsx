import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { SecondaryButton } from "@/src/core/components/Buttons";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// La fila de "Explorar proyectos": el campo de busqueda y el boton que abre
// los filtros, con el numero de grupos marcados. Reemplaza a
// `explore_search_row.dart`.
//
// No filtra nada por su cuenta: escribe la busqueda en el contexto, que es
// quien deriva las listas. El campo muestra lo del contexto, asi "Limpiar
// filtros" tambien borra lo escrito.
export function ExploreSearchRow() {
  const { searchQuery, setSearchQuery, activeFilterCount } = useProjects();
  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={AppTokens.iconSize} color={AppColors.secondary} />
        <TextInput
          testID={ExploreSearchRow.searchFieldKey}
          style={styles.input}
          placeholder="Buscar proyectos..."
          placeholderTextColor={AppColors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>
      <SecondaryButton
        testID={ExploreSearchRow.filtersButtonKey}
        icon="tune"
        label={activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : "Filtros"}
        onPress={() => navigation.navigate("ProjectFilters")}
      />
    </View>
  );
}

ExploreSearchRow.searchFieldKey = "TextFieldSearch";
ExploreSearchRow.filtersButtonKey = "ButtonFilters";

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
    gap: AppTokens.gapXs,
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.radius,
    paddingHorizontal: AppTokens.gapS,
  },
  input: { flex: 1, paddingVertical: AppTokens.gapM, ...AppTypography.bodyMedium },
});
