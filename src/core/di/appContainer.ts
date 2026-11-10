import { registerApplication } from "@/src/features/application/di";
import { registerAuth } from "@/src/features/auth/di";
import { registerFollow } from "@/src/features/follow/di";
import { registerPoll } from "@/src/features/poll/di";
import { registerProfile } from "@/src/features/profile/di";
import { registerProject } from "@/src/features/project/di";
import { registerShowcase } from "@/src/features/showcase/di";
import { registerWorkspace } from "@/src/features/workspace/di";
import { robleConfig } from "../roble/robleConfig";
import { RobleClient } from "../roble/RobleClient";
import { Container } from "./container";
import { TOKENS } from "./tokens";

// La raiz de composicion: el unico sitio que sabe que implementacion hay detras
// de cada interfaz. Cada funcionalidad se registra sola en su `di.ts`, como los
// `register…()` de Flutter, y aqui solo se llaman.
export function createAppContainer(): Container {
  const c = new Container();

  // Un solo cliente para toda la app: uno por pantalla daria a cada copia su propia sesion.
  const client = new RobleClient(robleConfig);
  c.register(TOKENS.RobleClient, client);

  registerAuth(c, client);
  registerProfile(c, client);
  registerProject(c, client);
  registerApplication(c, client);
  registerFollow(c, client);
  registerWorkspace(c, client);
  registerPoll(c, client);
  registerShowcase(c, client);

  return c;
}
