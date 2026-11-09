import { ILocalPreferences } from "../iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "../LocalPreferencesAsyncStorage";
import { Container } from "./container";
import { TOKENS } from "./tokens";

// Composition root: the only place that knows which implementation backs each interface.
// To switch a feature to another backend (e.g. Roble), change the data source created here.
export function createAppContainer(): Container {
  const c = new Container();

  const prefs: ILocalPreferences = LocalPreferencesAsyncStorage.getInstance();
  c.register(TOKENS.LocalPreferences, prefs);

  return c;
}
