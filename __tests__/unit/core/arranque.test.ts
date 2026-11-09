import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";

// `arranque_test.dart`: la app registra todas sus dependencias sin error. Si un
// `di.ts` se olvida de registrar su repositorio, la pantalla que lo pide
// revienta al abrirse; esto lo dice antes.
const repositories = Object.entries(TOKENS).filter(([name]) => name !== "RobleClient");

function missingIn(container: Container, tokens: [string, symbol][]) {
  return tokens.filter(([, token]) => !container.has(token)).map(([name]) => name);
}

describe("arranque", () => {
  it("el contenedor de Roble registra el cliente y un repositorio por funcionalidad", () => {
    // Construir el cliente no sale a la red: solo guarda la configuracion.
    process.env.EXPO_PUBLIC_ROBLE_BASE_URL = "https://roble-api.test-openlab.uninorte.edu.co";
    process.env.EXPO_PUBLIC_ROBLE_CONTRACT_ID = "innovation_hub_f5910840c3";
    // Los tokens de la misma carga que el contenedor: cada carga aislada crea
    // sus propios `Symbol`.
    let missing: string[] = ["sin cargar"];
    jest.isolateModules(() => {
      const { createAppContainer } = require("@/src/core/di/appContainer");
      const tokens: typeof TOKENS = require("@/src/core/di/tokens").TOKENS;
      missing = missingIn(createAppContainer(), Object.entries(tokens));
    });

    expect(missing).toEqual([]);
  });

  it("el contenedor en memoria registra los mismos repositorios", () => {
    const container = createLocalContainer(new DummyData({ latencyMs: 0 }));
    expect(missingIn(container, repositories)).toEqual([]);
  });

  it("cada contenedor en memoria trabaja sobre su propio DummyData", () => {
    const a = new DummyData({ latencyMs: 0 });
    const b = new DummyData({ latencyMs: 0 });
    a.projects.length = 0;
    expect(b.projects.length).toBeGreaterThan(0);
  });
});
