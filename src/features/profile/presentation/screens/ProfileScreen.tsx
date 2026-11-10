import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";
import { Pill } from "@/src/core/components/Pill";
import { useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { CompactProjectCard } from "@/src/features/myProjects/presentation/components/CompactProjectCard";
import { useMyProjectsViewModel } from "@/src/features/myProjects/presentation/viewmodels/useMyProjectsViewModel";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { useProfile } from "../context/ProfileContext";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => p.length > 0);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].substring(0, 1).toUpperCase();
  }
  return "?";
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { profile, isLoading: isProfileLoading, refresh: refreshProfile } = useProfile();
  const session = useSession();
  const {
    createdProjects,
    participatingProjects,
    activeProjectsCount,
    reload: reloadProjects,
  } = useMyProjectsViewModel();

  const [confirming, setConfirming] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleRefresh = async () => {
    await Promise.all([refreshProfile(), reloadProjects()]);
  };

  if (isProfileLoading && !profile) {
    return (
      <View testID={ProfileScreen.key} style={styles.center}>
        <ActivityIndicator color={AppColors.persimmon} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View testID={ProfileScreen.key} style={styles.center}>
        <Text style={styles.errorTitle}>No pudimos cargar tu perfil</Text>
        <View style={styles.retryButton}>
          <PrimaryButton label="Reintentar" onPress={refreshProfile} />
        </View>
      </View>
    );
  }

  return (
    <View testID={ProfileScreen.key} style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isProfileLoading}
            onRefresh={handleRefresh}
            colors={[AppColors.persimmon]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(profile.fullName)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text testID={ProfileScreen.nameKey} style={styles.name}>
              {profile.fullName}
            </Text>
            <Text testID={ProfileScreen.programKey} style={styles.program}>
              {`${profile.academicProgram} · ${profile.semester}.º semestre`}
            </Text>
            <Text style={styles.activeCount}>
              {activeProjectsCount === 1 ? "1 proyecto activo" : `${activeProjectsCount} proyectos activos`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades e intereses</Text>
          {profile.skills.length > 0 ? (
            <View style={styles.skillsWrap}>
              {profile.skills.map((s) => (
                <Pill key={s} label={s} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptySectionText}>No has registrado habilidades.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proyectos</Text>
          {activeProjectsCount === 0 ? (
            <Text style={styles.emptySectionText}>No tienes proyectos activos.</Text>
          ) : (
            <View style={styles.projectsList}>
              {createdProjects.map((p) => (
                <CompactProjectCard
                  key={p.id}
                  project={p}
                  bottomWidget={<Text style={styles.roleText}>Líder</Text>}
                  onTap={() => navigation.navigate("ProjectDetail", { project: p })}
                />
              ))}
              {participatingProjects.map((p) => (
                <CompactProjectCard
                  key={p.id}
                  project={p}
                  bottomWidget={<Text style={styles.roleText}>Participa</Text>}
                  onTap={() => navigation.navigate("ProjectDetail", { project: p })}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.logoutWrapper}>
          <SecondaryButton
            testID={ProfileScreen.logoutButtonKey}
            label="Cerrar sesión"
            onPress={() => setConfirming(true)}
          />
        </View>
      </ScrollView>

      <BottomSheet
        visible={confirming}
        onDismiss={() => setConfirming(false)}
        title="¿Cerrar sesión?"
        message="Volverás a la pantalla de inicio de sesión. Tus ideas y postulaciones se quedan como están."
      >
        <PrimaryButton
          testID={ProfileScreen.logoutConfirmButtonKey}
          label="Sí, cerrar sesión"
          loading={loggingOut}
          onPress={async () => {
            setLoggingOut(true);
            try {
              await session.logout();
              setConfirming(false);
            } finally {
              setLoggingOut(false);
            }
          }}
        />
        <SecondaryButton label="Volver" onPress={() => setConfirming(false)} />
      </BottomSheet>
    </View>
  );
}

ProfileScreen.key = "ProfileView";
ProfileScreen.nameKey = "ProfileName";
ProfileScreen.programKey = "ProfileProgram";
ProfileScreen.logoutButtonKey = "ButtonLogout";
ProfileScreen.logoutConfirmButtonKey = "ButtonLogoutConfirm";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: AppColors.paper },
  scroll: {
    padding: AppTokens.gapL,
    gap: AppTokens.gapXl,
    paddingBottom: AppTokens.gapXl * 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: AppTokens.gapXl,
    backgroundColor: AppColors.paper,
  },
  errorTitle: {
    ...AppTypography.titleMedium,
    textAlign: "center",
  },
  retryButton: {
    marginTop: AppTokens.gapM,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTokens.gapL,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AppColors.gold,
    borderWidth: AppTokens.borderWidth,
    borderColor: AppColors.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...AppTypography.headlineMedium,
    color: AppColors.ink,
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...AppTypography.titleLarge,
    fontWeight: "bold",
  },
  program: {
    ...AppTypography.bodyMedium,
  },
  activeCount: {
    ...AppTypography.bodyMedium,
    color: AppColors.persimmon,
    fontWeight: "600",
  },
  section: {
    gap: AppTokens.gapM,
  },
  sectionTitle: {
    ...AppTypography.titleMedium,
    fontWeight: "bold",
  },
  emptySectionText: {
    ...AppTypography.bodyMedium,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: AppTokens.gapXs,
  },
  projectsList: {
    gap: 0,
    marginHorizontal: -AppTokens.gapL,
  },
  roleText: {
    ...AppTypography.bodySmall,
    fontWeight: "600",
    color: AppColors.ink,
  },
  logoutWrapper: {
    marginTop: AppTokens.gapL,
  },
});
