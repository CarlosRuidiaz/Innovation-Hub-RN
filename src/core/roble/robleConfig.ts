// A que proyecto de Roble apunta la app.
//
// El host y el proyecto salen solo del archivo `.env` (ver `.env.example`), que
// no va al repositorio. Todo el grupo usa el mismo proyecto, el de la app
// Flutter (`lib/core/roble_config.dart`). Expo inyecta las variables
// `EXPO_PUBLIC_*` al compilar, asi que hay que leerlas con el nombre completo
// escrito: `process.env[nombre]` no funciona.
export const robleConfig = {
  baseUrl: process.env.EXPO_PUBLIC_ROBLE_BASE_URL ?? "",
  contractId: process.env.EXPO_PUBLIC_ROBLE_CONTRACT_ID ?? "",
};

// `EXPO_PUBLIC_DATA_SOURCE=local` arranca con los datos en memoria
// (`localContainer.ts`): la app entera sin servidor, para trabajar en la UI.
export const useLocalData = process.env.EXPO_PUBLIC_DATA_SOURCE === "local";

// Las variables obligatorias que no llegaron. Vacia si esta todo.
export function missingRobleConfig(): string[] {
  return [
    ...(robleConfig.baseUrl ? [] : ["EXPO_PUBLIC_ROBLE_BASE_URL"]),
    ...(robleConfig.contractId ? [] : ["EXPO_PUBLIC_ROBLE_CONTRACT_ID"]),
  ];
}
