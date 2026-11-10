import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { EmptyState } from "@/src/core/components/EmptyState";
import { Project } from "@/src/features/project/domain/entities/Project";
import { ExploreSearchRow } from "@/src/features/project/presentation/components/ExploreSearchRow";
import { ProjectCard } from "@/src/features/project/presentation/components/ProjectCard";
import { ShowcaseBanner } from "@/src/features/project/presentation/components/ShowcaseBanner";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { ProfileSkillsLine } from "@/src/features/profile/presentation/components/ProfileSkillsLine";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";

// Pantalla principal de la cartelera con dos pestanas.
// Reemplaza a `cartelera_view.dart` y `home_page.dart` (la parte de las tabs).
export default function CarteleraScreen() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const { projects, isLoading, mySkills, projectsForMySkills, allVisibleProjects, refresh, clearFilters } =
    useProjects();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  function handleCardPress(project: Project) {
    navigation.navigate("ProjectDetail", { project });
  }

  // --- Pestana "Para tus habilidades" ---
  function renderSkillsTab() {
    if (isLoading && projects.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={AppColors.persimmon} />
        </View>
      );
    }

    if (projectsForMySkills.length === 0) {
      const sinHabilidades = mySkills.length === 0;
      return (
        <FlatList
          testID="ListaParaTusHabilidades"
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <ProfileSkillsLine />
          }
          ListEmptyComponent={
            <EmptyState
              testID="EmptyParaTusHabilidades"
              icon={sinHabilidades ? "person-search" : "search-off"}
              title={
                sinHabilidades
                  ? "Todavía no tienes habilidades registradas"
                  : "Ningún proyecto pide tus habilidades"
              }
              message={
                sinHabilidades
                  ? "Sin habilidades en tu perfil no podemos saber qué proyectos te sirven. Mientras tanto, puedes mirarlos todos."
                  : "Ninguno de los proyectos publicados busca alguna de tus habilidades. Prueba a mirar la cartelera completa."
              }
              actionLabel="Explorar proyectos"
              onAction={() => setActiveTab(1)}
            />
          }
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={AppColors.persimmon} />}
        />
      );
    }

    return (
      <FlatList
        testID="ListaParaTusHabilidades"
        data={projectsForMySkills}
        keyExtractor={(p) => p.id ?? p.title}
        renderItem={({ item }) => (
          <ProjectCard
            key={`ProjectCard-${item.id}`}
            testID={`ProjectCard-${item.id}`}
            project={item}
            onPress={() => handleCardPress(item)}
          />
        )}
        ListHeaderComponent={<ProfileSkillsLine />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={AppColors.persimmon} />}
      />
    );
  }

  // --- Pestana "Explorar proyectos" ---
  function renderExploreTab() {
    if (isLoading && projects.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={AppColors.persimmon} />
        </View>
      );
    }

    if (allVisibleProjects.length === 0) {
      return (
        <FlatList
          testID="ListaExplorar"
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              <ExploreSearchRow />
              <ShowcaseBanner />
            </>
          }
          ListEmptyComponent={
            <EmptyState
              testID="EmptyExplorar"
              icon="filter-list-off"
              title="Ningún proyecto coincide"
              message="Prueba quitando algún filtro o buscando con otras palabras."
              actionLabel="Limpiar filtros"
              onAction={clearFilters}
            />
          }
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={AppColors.persimmon} />}
        />
      );
    }

    return (
      <FlatList
        testID="ListaExplorar"
        data={allVisibleProjects}
        keyExtractor={(p) => p.id ?? p.title}
        renderItem={({ item }) => (
          <ProjectCard
            key={`ProjectCard-${item.id}`}
            testID={`ProjectCard-${item.id}`}
            project={item}
            onPress={() => handleCardPress(item)}
          />
        )}
        ListHeaderComponent={
          <>
            <ExploreSearchRow />
            <ShowcaseBanner />
          </>
        }
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={AppColors.persimmon} />}
      />
    );
  }

  return (
    <View testID={CarteleraScreen.key} style={styles.root}>
      {/* Barra de pestanas */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          testID="TabParaTusHabilidades"
          style={[styles.tab, activeTab === 0 && styles.tabActive]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>Para tus habilidades</Text>
          {activeTab === 0 && <View style={styles.indicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          testID="TabExplorar"
          style={[styles.tab, activeTab === 1 && styles.tabActive]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>Explorar proyectos</Text>
          {activeTab === 1 && <View style={styles.indicator} />}
        </TouchableOpacity>
      </View>

      {/* Contenido de la pestana activa */}
      <View style={styles.content}>
        {activeTab === 0 ? renderSkillsTab() : renderExploreTab()}
      </View>
    </View>
  );
}

CarteleraScreen.key = "CarteleraView";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.paper },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: AppTokens.borderWidth,
    borderBottomColor: AppColors.hatch,
    backgroundColor: AppColors.paper,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: AppTokens.gapM,
    position: "relative",
  },
  tabActive: {},
  tabLabel: { ...AppTypography.tab, color: AppColors.secondary },
  tabLabelActive: { color: AppColors.ink },
  indicator: {
    position: "absolute",
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: AppColors.persimmon,
    borderRadius: 2,
  },
  content: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingTop: AppTokens.gapM },
});
