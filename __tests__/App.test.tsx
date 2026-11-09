import { render, screen } from "@testing-library/react-native";
import React from "react";

import { AppRoot } from "../App";
import { DummyData } from "../src/core/data/dummyData";
import { createLocalContainer } from "../src/core/di/localContainer";
import LoginScreen from "../src/features/auth/presentation/screens/LoginScreen";

describe("App", () => {
  it("con los datos en memoria y sin sesion abre el login", async () => {
    render(<AppRoot container={createLocalContainer(new DummyData({ latencyMs: 0 }))} />);
    expect(await screen.findByTestId(LoginScreen.key)).toBeTruthy();
  });
});
