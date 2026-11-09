import { registerApplicationLocal } from "@/src/features/application/di";
import { registerAuthLocal } from "@/src/features/auth/di";
import { registerFollowLocal } from "@/src/features/follow/di";
import { registerPollLocal } from "@/src/features/poll/di";
import { registerProfileLocal } from "@/src/features/profile/di";
import { registerProjectLocal } from "@/src/features/project/di";
import { registerShowcaseLocal } from "@/src/features/showcase/di";
import { registerWorkspaceLocal } from "@/src/features/workspace/di";
import { DummyData } from "../data/dummyData";
import { Container } from "./container";

// Los mismos repositorios, con los datasources de memoria (las fuentes
// `local_*_source.dart` de Flutter). Es lo que usan las pruebas de integracion
// y sirve para trabajar en la UI sin servidor (`npm run start:local`). Que solo
// cambie el datasource es la prueba de que la separacion vale.
export function createLocalContainer(data: DummyData = new DummyData()): Container {
  const c = new Container();

  registerAuthLocal(c, data);
  registerProfileLocal(c, data);
  registerProjectLocal(c, data);
  registerApplicationLocal(c, data);
  registerFollowLocal(c, data);
  registerWorkspaceLocal(c, data);
  registerPollLocal(c, data);
  registerShowcaseLocal(c, data);

  return c;
}
