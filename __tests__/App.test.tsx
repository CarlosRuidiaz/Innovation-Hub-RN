import { render, screen } from "@testing-library/react-native";
import React from "react";

import { AppRoot } from "../App";
import { DummyData } from "../src/core/data/dummyData";
import { createLocalContainer } from "../src/core/di/localContainer";

describe("App", () => {
  it("con los datos en memoria abre la app", async () => {
    render(<AppRoot container={createLocalContainer(new DummyData({ latencyMs: 0 }))} />);
    expect(await screen.findByText("Home screen...")).toBeTruthy();
  });
});
