# Innovation Hub

La cartelera de proyectos del Grupo 4 de Programación Móvil (Universidad del Norte), en React Native. Los
estudiantes publican ideas de proyecto, se postulan, forman equipos y documentan sus avances. El backend y la
autenticación son de **Roble**.

Es la migración de la app Flutter del grupo, hecha como `f_market` → `r_market`: sobre el template
`rn-uninorte-expo-template` del curso y con el paquete `roble-client`.

## Correrla

Hace falta Node.js 24 (mínimo 22.13).

```bash
npm install
cp .env.example .env        # en Windows: copy .env.example .env
npm start                   # luego "a" para Android o "w" para el navegador
```

Sin `.env` la app no sabe a qué proyecto de Roble conectarse, y lo dice en pantalla.

Para trabajar en la interfaz sin servidor, con los datos en memoria:

```bash
npm run start:local
```

Ahí se entra con `carlos.ruidiaz@uninorte.edu.co` y la clave `Clave!2026`. Los datos se pierden al cerrar la
app.

## Pruebas

```bash
npm run typecheck
npm run lint
npm run test:ci             # o test:unit, test:component, test:integration
```

Las pruebas no usan Roble: corren con fuentes falsas o con los datos en memoria. GitHub Actions corre las tres
en cada push.

## Estructura

```
App.tsx                     proveedores, sesión y navegación
src/
  theme/                    "Cartelera": colores, medidas y tipografía (tokens.ts) y el tema de Paper
  core/
    components/             piezas que usan varias funcionalidades
    catalogs.ts             habilidades, tags, programas y tipos de innovación
    roble/                  cliente, configuración y formato de las filas de Roble
    di/                     contenedor de dependencias (appContainer y localContainer)
    data/dummyData.ts       las filas en memoria
    feedback/               la barra de avisos
  navigation/               rutas, barra inferior y puerta de sesión
  features/<funcionalidad>/
    domain/                 entidades, interfaz del repositorio y su Failure
    data/                   convertidores de filas, datasources (Roble y memoria) y repositorio
    presentation/           pantallas, componentes y contextos
    di.ts                   registra el repositorio con Roble y en memoria
__tests__/                  unit, component, integration y support
```

Cada ruta importa su pantalla desde la carpeta de su funcionalidad, y cada funcionalidad registra lo suyo en
su `di.ts`: migrar una pantalla no toca la navegación ni los contenedores.

## Roble se comparte con la app Flutter

La app Flutter sigue en uso sobre el mismo proyecto de Roble. Por eso:

- Nunca se cambia, renombra ni borra una tabla o una columna que ya existe.
- Se escribe en cada tabla exactamente como lo hace Flutter: los convertidores de `data/mappers/` producen lo
  mismo que su `toJsonNoId` (listas como texto JSON, fechas en hora local sin zona) y sus pruebas lo comparan.
- El perfil del estudiante viaja en el `extra` de la cuenta con los nombres que lee Flutter
  (`academicProgram`, `semester`, `skills`, `bio`).
- Lo nuevo va en tablas nuevas: `project_types` y `application_messages`.
