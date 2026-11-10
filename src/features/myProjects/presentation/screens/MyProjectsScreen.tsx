import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { PaperCard } from "@/src/core/components/PaperCard";
import { Pill } from "@/src/core/components/Pill";
import { TypeTile } from "@/src/core/components/TypeTile";
import { AppColors, AppFonts, AppTokens, AppTypography } from "@/src/theme/tokens";
import { CompactProjectCard } from "../components/CompactProjectCard";
import { useMyProjectsViewModel } from "../viewmodels/useMyProjectsViewModel";

type Tab = "created" | "participating" | "following";

export default function MyProjectsScreen({ onExplore }: { onExplore?: () => void }) {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>("created");

  const {
    isLoading,
    error,
    createdProjects,
    participatingProjects,
    followingProjects,
    myApplications,
    allProjects,
    pendingFor,
    reload,
  } = useMyProjectsViewModel();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const projectById = useMemo(() => {
    const map = new Map<string, (typeof allProjects)[0]>();
    for (const p of allProjects) {
      if (p.id) map.set(p.id, p);
    }
    return map;
  }, [allProjects]);

  // En "Donde participo": solo las pendientes y las rechazadas en "Tus postulaciones".
  const inReviewApplications = useMemo(() => {
    return myApplications.filter(
      (a) => a.status === "pending" || a.status === "rejected",
    );
  }, [myApplications]);

  const pendingReviewCount = useMemo(() => {
    return inReviewApplications.filter((a) => a.status === "pending").length;
  }, [inReviewApplications]);

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else {
      // @ts-expect-error Tabs navigation to Home
      navigation.navigate("Home");
    }
  };

  return (
    <View testID={MyProjectsScreen.key} style={styles.flex}>
      <View style={styles.tabBar}>
        <Pressable
          testID={MyProjectsScreen.createdTabKey}
          onPress={() => setActiveTab("created")}
          style={styles.tabItem}
        >
          <Text style={[styles.tabText, activeTab === "created" && styles.tabTextActive]}>
            Creados por mí
          </Text>
          {activeTab === "created" ? <View style={styles.tabIndicator} /> : null}
        </Pressable>

        <Pressable
          testID={MyProjectsScreen.participatingTabKey}
          onPress={() => setActiveTab("participating")}
          style={styles.tabItem}
        >
          <Text style={[styles.tabText, activeTab === "participating" && styles.tabTextActive]}>
            Donde participo
          </Text>
          {activeTab === "participating" ? <View style={styles.tabIndicator} /> : null}
        </Pressable>

        <Pressable
          testID={MyProjectsScreen.followingTabKey}
          onPress={() => setActiveTab("following")}
          style={styles.tabItem}
        >
          <Text style={[styles.tabText, activeTab === "following" && styles.tabTextActive]}>
            Siguiendo
          </Text>
          {activeTab === "following" ? <View style={styles.tabIndicator} /> : null}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            colors={[AppColors.persimmon]}
          />
        }
      >
        {error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>No pudimos cargar tus proyectos</Text>
            <View style={styles.ctaButton}>
              <PrimaryButton label="Reintentar" onPress={reload} />
            </View>
          </View>
        ) : isLoading && createdProjects.length === 0 && participatingProjects.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={AppColors.persimmon} size="large" />
          </View>
        ) : activeTab === "created" ? (
          createdProjects.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyTitle}>Todavía no has creado proyectos</Text>
              <View style={styles.ctaButton}>
                <PrimaryButton
                  label="Publicar una idea"
                  onPress={() => navigation.navigate("CreateIdea")}
                />
              </View>
            </View>
          ) : (
            createdProjects.map((project) => {
              const pending = pendingFor(project.id);
              const label = pending === 1 ? "1 pendiente" : `${pending} pendientes`;
              return (
                <CompactProjectCard
                  key={project.id}
                  project={project}
                  onTap={() => navigation.navigate("ProjectDetail", { project })}
                  trailing={
                    <Pill
                      label={label}
                      background={AppColors.card}
                      foreground={pending > 0 ? AppColors.persimmon : AppColors.secondary}
                    />
                  }
                />
              );
            })
          )
        ) : activeTab === "participating" ? (
          inReviewApplications.length === 0 && participatingProjects.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyTitle}>Todavía no participas en ningún proyecto</Text>
              <View style={styles.ctaButton}>
                <PrimaryButton label="Explorar proyectos" onPress={handleExplore} />
              </View>
            </View>
          ) : (
            <View style={styles.sectionGroup}>
              {inReviewApplications.length > 0 ? (
                <>
                  <Text style={styles.sectionHeader}>
                    {`TUS POSTULACIONES · ${pendingReviewCount} EN REVISIÓN`}
                  </Text>
                  <PaperCard margin={styles.postulacionesCardMargin} padding={0}>
                    {inReviewApplications.map((app, index) => {
                      const proj = projectById.get(app.projectId);
                      const isLast = index === inReviewApplications.length - 1;
                      return (
                        <Pressable
                          key={app.id ?? index}
                          onPress={() => navigation.navigate("ApplicationStatus", { application: app })}
                          style={[styles.postulacionRow, !isLast && styles.postulacionDivider]}
                          accessibilityRole="button"
                          accessibilityLabel={`Postulación a ${proj?.title ?? "proyecto"}`}
                        >
                          <TypeTile type={proj?.innovationType} compact />

                          <View style={styles.postulacionInfo}>
                            <Text style={styles.postulacionTitle}>
                              {proj?.title ?? "Cargando proyecto…"}
                            </Text>
                            <Text style={styles.postulacionSkills} numberOfLines={1}>
                              {app.skillsOffered.length > 0
                                ? `Aportas: ${app.skillsOffered.join(" · ")}`
                                : "Sin habilidades específicas"}
                            </Text>
                            <View style={styles.postulacionPillWrapper}>
                              {app.status === "pending" ? (
                                <Pill
                                  label="EN REVISIÓN"
                                  background={AppColors.gold}
                                  foreground={AppColors.ink}
                                />
                              ) : (
                                <Pill
                                  label="NO ACEPTADA"
                                  background={AppColors.card}
                                  foreground={AppColors.secondary}
                                  borderColor={AppColors.secondary}
                                />
                              )}
                            </View>
                          </View>

                          <MaterialIcons
                            name="chevron-right"
                            size={AppTokens.iconSize}
                            color={AppColors.secondary}
                          />
                        </Pressable>
                      );
                    })}
                  </PaperCard>
                </>
              ) : null}

              {participatingProjects.length > 0 ? (
                <>
                  <Text style={styles.sectionHeader}>TUS EQUIPOS</Text>
                  {participatingProjects.map((project) => (
                    <CompactProjectCard
                      key={project.id}
                      project={project}
                      onTap={() => navigation.navigate("ProjectDetail", { project })}
                    />
                  ))}
                </>
              ) : null}
            </View>
          )
        ) : followingProjects.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>No sigues ningún proyecto</Text>
            <View style={styles.ctaButton}>
              <PrimaryButton label="Explorar proyectos" onPress={handleExplore} />
            </View>
          </View>
        ) : (
          followingProjects.map((project) => (
            <CompactProjectCard
              key={project.id}
              project={project}
              onTap={() => navigation.navigate("ProjectDetail", { project })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

MyProjectsScreen.key = "MyProjectsView";
MyProjectsScreen.createdTabKey = "TabCreados";
MyProjectsScreen.participatingTabKey = "TabParticipo";
MyProjectsScreen.followingTabKey = "TabSiguiendo";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: AppColors.paper },
  tabBar: {
    flexDirection: "row",
    backgroundColor: AppColors.paper,
    borderBottomWidth: AppTokens.hairline,
    borderBottomColor: AppColors.ink,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: AppTokens.gapM,
    position: "relative",
  },
  tabText: {
    ...AppTypography.tab,
    color: AppColors.secondary,
  },
  tabTextActive: {
    color: AppColors.ink,
    fontFamily: AppFonts.bodyBold,
  },
  tabIndicator: {
    position: "absolute",
    bottom: -AppTokens.hairline,
    left: AppTokens.gapL,
    right: AppTokens.gapL,
    height: AppTokens.navIndicatorHeight,
    backgroundColor: AppColors.persimmon,
    borderRadius: AppTokens.navIndicatorRadius,
  },
  scrollContent: {
    paddingVertical: AppTokens.gapL,
    gap: AppTokens.gapM,
  },
  centerContainer: {
    padding: AppTokens.gapXl,
    alignItems: "center",
    justifyContent: "center",
    gap: AppTokens.gapM,
    marginTop: AppTokens.gapXl,
  },
  emptyTitle: {
    ...AppTypography.titleMedium,
    textAlign: "center",
  },
  errorText: {
    ...AppTypography.titleMedium,
    textAlign: "center",
  },
  ctaButton: {
    marginTop: AppTokens.gapS,
  },
  sectionGroup: {
    gap: AppTokens.gapM,
  },
  sectionHeader: {
    ...AppTypography.bodySmall,
    textTransform: "uppercase",
    fontFamily: AppFonts.bodyBold,
    letterSpacing: AppTokens.labelLetterSpacing,
    paddingHorizontal: AppTokens.gapL,
    color: AppColors.secondary,
  },
  postulacionesCardMargin: {
    marginHorizontal: AppTokens.gapL,
    marginBottom: AppTokens.gapM,
  },
  postulacionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: AppTokens.gapM,
    gap: AppTokens.gapM,
  },
  postulacionDivider: {
    borderBottomWidth: AppTokens.hairline,
    borderBottomColor: AppColors.hatch,
  },
  postulacionInfo: {
    flex: 1,
    gap: AppTokens.gapXs,
  },
  postulacionTitle: {
    ...AppTypography.titleMedium,
    fontFamily: AppFonts.displayBold,
  },
  postulacionSkills: {
    ...AppTypography.bodySmall,
    color: AppColors.secondary,
  },
  postulacionPillWrapper: {
    alignSelf: "flex-start",
    marginTop: AppTokens.hairGap,
  },
});
