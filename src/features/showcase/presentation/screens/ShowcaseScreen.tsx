import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/core/components/Buttons";
import { EmptyState } from "@/src/core/components/EmptyState";
import { RootStackParamList } from "@/src/navigation/types";
import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { ShowcaseBackButton } from "../components/ShowcaseBackButton";
import { ShowcaseProjectCard } from "../components/ShowcaseProjectCard";
import { useShowcaseViewModel } from "../viewmodels/useShowcaseViewModel";

// La vitrina de prototipos: `showcase_view.dart`. Solo los proyectos en etapa
// Prototype, cada uno con sus comentarios y su promedio.
export default function ShowcaseScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { prototypes, statsFor, isLoading, error, load } = useShowcaseViewModel();
  const [refreshing, setRefreshing] = useState(false);

  // Al entrar y al volver del detalle, donde pudieron cambiar las cifras: en
  // Flutter las compartia el mismo controlador.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[AppColors.persimmon]}
      tintColor={AppColors.persimmon}
    />
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]} testID={ShowcaseScreen.key}>
      <View style={styles.header}>
        <ShowcaseBackButton />
        <Text style={styles.title}>Vitrina de prototipos</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.intro}>
        Proyectos en etapa Prototype, abiertos a comentarios de toda la universidad.
      </Text>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={AppColors.persimmon} />
        </View>
      ) : (
        <FlatList
          testID={ShowcaseKeys.list}
          data={prototypes}
          keyExtractor={(p, i) => p.id ?? String(i)}
          contentContainerStyle={prototypes.length === 0 ? styles.emptyContent : styles.listContent}
          refreshControl={refreshControl}
          renderItem={({ item }) => {
            const stats = statsFor(item.id);
            return (
              <ShowcaseProjectCard
                project={item}
                commentCount={stats.commentCount}
                overallAverage={stats.overallAverage}
                onPress={() => navigation.navigate("PrototypeDetail", { project: item })}
              />
            );
          }}
          ListEmptyComponent={
            error.length > 0 ? (
              <ErrorState message={error} onRetry={load} />
            ) : (
              <EmptyState
                icon="science"
                title="No hay prototipos en vitrina"
                message="Por ahora ningún proyecto se encuentra en la etapa Prototype."
                actionLabel="Actualizar"
                onAction={load}
                testID={ShowcaseKeys.empty}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

ShowcaseScreen.key = "ShowcaseView";

export const ShowcaseKeys = {
  list: "ShowcaseList",
  empty: "ShowcaseEmpty",
  error: "ShowcaseError",
  retry: "ButtonShowcaseRetry",
};

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.error} testID={ShowcaseKeys.error}>
      <MaterialIcons name="error-outline" size={AppTokens.emptyIconSize} color={AppColors.persimmon} />
      <Text style={styles.errorTitle}>Ocurrió un error al cargar</Text>
      <Text style={styles.errorMessage}>{message.length > 0 ? message : "No se pudo conectar con el servidor."}</Text>
      <PrimaryButton label="Reintentar" onPress={onRetry} testID={ShowcaseKeys.retry} style={styles.retry} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.paper },
  header: {
    paddingHorizontal: AppTokens.gapL,
    paddingTop: AppTokens.gapL,
    paddingBottom: AppTokens.gapM,
    gap: AppTokens.gapM,
  },
  title: AppTypography.headlineMedium,
  divider: { height: AppTokens.borderWidth, backgroundColor: AppColors.ink },
  intro: { ...AppTypography.bodyMedium, color: AppColors.secondary, padding: AppTokens.gapL },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingTop: AppTokens.gapS, paddingBottom: AppTokens.gapXl },
  emptyContent: { flexGrow: 1 },
  error: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: AppTokens.gapXl },
  errorTitle: { ...AppTypography.titleMedium, textAlign: "center", marginTop: AppTokens.gapM },
  errorMessage: { ...AppTypography.bodyMedium, color: AppColors.secondary, textAlign: "center", marginTop: AppTokens.gapS },
  retry: { marginTop: AppTokens.gapL },
});
