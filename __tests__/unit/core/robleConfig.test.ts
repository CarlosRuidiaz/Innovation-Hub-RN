import fs from "fs";
import path from "path";

// `roble_config_test.dart`: los valores reales tienen que construir el cliente
// sin lanzar. Un valor malo tumbaria la app al arrancar sin que el typecheck ni
// el resto de las pruebas digan nada. Aqui los valores salen de `.env.example`,
// que es lo que cada quien copia como `.env`.
function readEnvExample(): Record<string, string> {
  const text = fs.readFileSync(path.join(process.cwd(), ".env.example"), "utf8");
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]),
  );
}

// `robleConfig` lee las variables al cargarse: cada prueba lo carga de nuevo
// con las que quiere.
function loadWith(env: Record<string, string | undefined>) {
  const saved = { ...process.env };
  Object.assign(process.env, env);
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k];
  let mod: typeof import("@/src/core/roble/robleConfig") | undefined;
  jest.isolateModules(() => {
    mod = require("@/src/core/roble/robleConfig");
  });
  process.env = saved;
  return mod!;
}

describe("robleConfig", () => {
  const example = readEnvExample();

  it(".env.example trae el proyecto de Roble de la app Flutter", () => {
    // Los de `lib/core/roble_config.dart`: todo el grupo usa el mismo proyecto.
    expect(example.EXPO_PUBLIC_ROBLE_BASE_URL).toBe("https://roble-api.test-openlab.uninorte.edu.co");
    expect(example.EXPO_PUBLIC_ROBLE_CONTRACT_ID).toBe("innovation_hub_f5910840c3");
  });

  it("sin .env dice que variables faltan", () => {
    const { missingRobleConfig } = loadWith({ EXPO_PUBLIC_ROBLE_BASE_URL: undefined, EXPO_PUBLIC_ROBLE_CONTRACT_ID: undefined });
    expect(missingRobleConfig()).toEqual(["EXPO_PUBLIC_ROBLE_BASE_URL", "EXPO_PUBLIC_ROBLE_CONTRACT_ID"]);
  });

  it("con los valores de .env.example no falta nada y el cliente se construye sin sesion", () => {
    const { robleConfig, missingRobleConfig } = loadWith(example);
    expect(missingRobleConfig()).toEqual([]);

    const { RobleClient } = require("@/src/core/roble/RobleClient");
    const client = new RobleClient(robleConfig);
    expect(client.isLoggedIn).toBe(false);
    expect(client.currentUserId).toBeNull();
  });

  it("EXPO_PUBLIC_DATA_SOURCE=local elige los datos en memoria", () => {
    expect(loadWith({ EXPO_PUBLIC_DATA_SOURCE: "local" }).useLocalData).toBe(true);
    expect(loadWith({ EXPO_PUBLIC_DATA_SOURCE: undefined }).useLocalData).toBe(false);
  });
});
