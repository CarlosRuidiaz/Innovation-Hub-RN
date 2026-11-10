import { render, screen } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MissingConfigScreen } from "@/src/core/roble/MissingConfigScreen";
import { safeAreaMetrics } from "@/__tests__/support/renderScreen";

// Lo que ve quien arranca la app sin el archivo `.env`.
function renderMissing(missing: string[]) {
  render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <MissingConfigScreen missing={missing} />
    </SafeAreaProvider>,
  );
}

describe("MissingConfigScreen", () => {
  it("nombra las variables que faltan", () => {
    renderMissing(["EXPO_PUBLIC_ROBLE_CONTRACT_ID"]);
    expect(screen.getByText("Falta la configuración")).toBeTruthy();
    expect(screen.getByText("•  EXPO_PUBLIC_ROBLE_CONTRACT_ID")).toBeTruthy();
    expect(screen.queryByText("•  EXPO_PUBLIC_ROBLE_BASE_URL")).toBeNull();
  });

  it("dice como arrancar con el .env", () => {
    renderMissing(["EXPO_PUBLIC_ROBLE_BASE_URL"]);
    expect(screen.getByText("npx expo start --clear")).toBeTruthy();
  });
});
