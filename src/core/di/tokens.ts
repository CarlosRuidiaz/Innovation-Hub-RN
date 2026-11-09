// Un token por dependencia registrada en el contenedor (ver `appContainer.ts`).
//
// Estan todos desde ya, uno por funcionalidad con datos: ningun carril tiene
// que volver a tocar este archivo. Una pantalla pide su repositorio con
// `useInject<ProjectRepository>(TOKENS.ProjectRepo)`.
export const TOKENS = {
  RobleClient: Symbol("RobleClient"),
  AuthRepo: Symbol("AuthRepo"),
  ProfileRepo: Symbol("ProfileRepo"),
  ProjectRepo: Symbol("ProjectRepo"),
  ApplicationRepo: Symbol("ApplicationRepo"),
  FollowRepo: Symbol("FollowRepo"),
  WorkspaceRepo: Symbol("WorkspaceRepo"),
  PollRepo: Symbol("PollRepo"),
  ShowcaseRepo: Symbol("ShowcaseRepo"),
} as const;
