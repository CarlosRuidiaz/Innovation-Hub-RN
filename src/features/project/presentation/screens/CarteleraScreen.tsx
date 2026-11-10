import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/src/core/components/EmptyState";
import { ProfileSkillsLine } from "@/src/features/profile/presentation/components/ProfileSkillsLine";
import { Project } from "@/src/features/project/domain/entities/Project";
import { CommunityBanner } from "@/src/features/project/presentation/components/CommunityBanner";
import { CommunityStats } from "@/src/features/project/presentation/components/CommunityStats";
import { ExploreSearchRow } from "@/src/features/project/presentation/components/ExploreSearchRow";
import { ProjectCard } from "@/src/features/project/presentation/components/ProjectCard";
import { ShowcaseBanner } from "@/src/features/project/presentation/components/ShowcaseBanner";
import { useProjects } from "@/src/features/project/presentation/context/ProjectsContext";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

type Tab = 0 | 1;

// La cartelera con sus dos pestañas. Reemplaza a `cartelera_view.dart`.
//
// En "Explorar", lo de arriba queda fijo (la busqueda, las cifras de Kora y el
// banner) y solo la lista se desliza y se refresca. En "Para tus habilidades",
// la frase de la comunidad (Kora) y "Proyectos que buscan…" van como
// encabezado de la lista: al deslizar, toda la pantalla queda para los
// proyectos.
export default function CarteleraScreen() {
  const [activeTab, setActiveTab] = useState<Tab>(0);
  const { projects, isLoading, mySkills, projectsForMySkills, allVisibleProjects, refresh, clearFilters } =
    useProjects();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // El indicador a pantalla completa solo cuando todavia no hay nada que
  // mostrar; si no, la lista parpadea al refrescar.
  const firstLoad = isLoading && projects.length === 0;
  const sinHabilidades = mySkills.length === 0;

  const list = (data: Project[], testID: string, empty: React.ReactElement, header?: React.ReactElement) => (
    <FlatList
      testID={testID}
      data={data}
      keyExtractor={(p) => p.id ?? p.title}
      renderItem={({ item }) => (
        <ProjectCard
          testID={ProjectCard.keyFor(item)}
          project={item}
          onPress={() => navigation.navigate("ProjectDetail", { project: item })}
        />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      contentContainerStyle={data.length === 0 ? styles.emptyList : styles.list}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[AppColors.persimmon]} tintColor={AppColors.persimmon} />}
    />
  );

  return (
    <View testID={CarteleraScreen.key} style={styles.root}>
      <View style={styles.tabBar}>
        <TabButton testID={CarteleraScreen.skillsTabKey} label="Para tus habilidades" active={activeTab === 0} onPress={() => setActiveTab(0)} />
        <TabButton testID={CarteleraScreen.exploreTabKey} label="Explorar proyectos" active={activeTab === 1} onPress={() => setActiveTab(1)} />
      </View>

      {activeTab === 0 ? (
        <View style={styles.flex}>
          {firstLoad ? (
            <Loading />
          ) : (
            list(
              projectsForMySkills,
              CarteleraScreen.skillsListKey,
              <EmptyState
                testID={CarteleraScreen.skillsEmptyKey}
                icon={sinHabilidades ? "person-search" : "search-off"}
                title={sinHabilidades ? "Todavía no tienes habilidades registradas" : "Ningún proyecto pide tus habilidades"}
                message={
                  sinHabilidades
                    ? "Sin habilidades en tu perfil no podemos saber qué proyectos te sirven. Mientras tanto, puedes mirarlos todos."
                    : "Ninguno de los proyectos publicados busca alguna de tus habilidades. Prueba a mirar la cartelera completa."
                }
                actionLabel="Explorar proyectos"
                onAction={() => setActiveTab(1)}
              />,
              <View>
                <CommunityBanner />
                <ProfileSkillsLine />
              </View>,
            )
          )}
        </View>
      ) : (
        <View style={styles.flex}>
          <ExploreSearchRow />
          <CommunityStats />
          <ShowcaseBanner />
          {firstLoad ? (
            <Loading />
          ) : (
            list(
              allVisibleProjects,
              CarteleraScreen.exploreListKey,
              <EmptyState
                testID={CarteleraScreen.exploreEmptyKey}
                icon="filter-alt-off"
                title="Ningún proyecto coincide"
                message="Prueba quitando algún filtro o buscando con otras palabras."
                actionLabel="Limpiar filtros"
                onAction={clearFilters}
              />,
            )
          )}
        </View>
      )}
    </View>
  );
}

// Una pestaña de arriba (`tabBarTheme`): activa en tinta con la raya
// persimmon a todo lo ancho; inactiva en gris.
function TabButton({ label, active, onPress, testID }: { label: string; active: boolean; onPress: () => void; testID: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={styles.tab}>
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
      <View style={[styles.indicator, active ? styles.indicatorActive : null]} />
    </Pressable>
  );
}

function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={AppColors.persimmon} />
    </View>
  );
}

// Las `Key` de Flutter.
CarteleraScreen.key = "CarteleraView";
CarteleraScreen.skillsTabKey = "TabParaTusHabilidades";
CarteleraScreen.exploreTabKey = "TabExplorar";
CarteleraScreen.skillsListKey = "ListaParaTusHabilidades";
CarteleraScreen.exploreListKey = "ListaExplorar";
CarteleraScreen.skillsEmptyKey = "EmptyParaTusHabilidades";
CarteleraScreen.exploreEmptyKey = "EmptyExplorar";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.paper },
  flex: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: AppTokens.borderWidth,
    borderBottomColor: AppColors.ink,
    backgroundColor: AppColors.paper,
  },
  tab: { flex: 1, alignItems: "center", paddingTop: AppTokens.gapM },
  tabLabel: { ...AppTypography.tab, color: AppColors.secondary, marginBottom: AppTokens.gapM },
  tabLabelActive: { color: AppColors.ink },
  indicator: { alignSelf: "stretch", height: AppTokens.navIndicatorHeight },
  indicatorActive: { backgroundColor: AppColors.persimmon },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingTop: AppTokens.gapM },
  emptyList: { flexGrow: 1, paddingTop: AppTokens.gapM },
});
