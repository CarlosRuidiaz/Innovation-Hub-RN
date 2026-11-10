import React, { useCallback, useState } from "react";
import { RefreshControl } from "react-native";

import { AppColors } from "@/src/theme/tokens";

// Deslizar hacia abajo para refrescar: el `RefreshIndicator` que envuelve las
// tres pestañas del espacio de trabajo en Flutter. El indicador gira mientras
// dura la recarga y la lista sigue a la vista: nunca se cambia por el
// indicador de carga de pantalla completa.
//
// La lista tiene que poder deslizarse aunque este vacia o sea corta (el
// `AlwaysScrollableScrollPhysics` de Flutter): en React Native un `ScrollView`
// o una `FlatList` con `refreshControl` ya lo permite.
export function useRefreshControl(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={[AppColors.persimmon]}
      tintColor={AppColors.persimmon}
      progressBackgroundColor={AppColors.card}
    />
  );
}
