import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { DIProvider } from "@/src/core/di/DIProvider";
import { SessionProvider, useSession } from "@/src/features/auth/presentation/context/SessionContext";
import { ProfileProvider, useProfile } from "@/src/features/profile/presentation/context/ProfileContext";

// `cambio_de_sesion_test.dart`: el perfil es de quien tenga la sesion.
function renderBoth(data: DummyData) {
  const container = createLocalContainer(data);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DIProvider container={container}>
      <SessionProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </SessionProvider>
    </DIProvider>
  );
  return renderHook(() => ({ session: useSession(), profile: useProfile() }), { wrapper });
}

describe("el perfil sigue a la sesion", () => {
  let data: DummyData;

  beforeEach(() => {
    data = new DummyData({ latencyMs: 0 });
  });

  it("sin sesion, el perfil queda vacio sin reventar", async () => {
    const { result } = renderBoth(data);
    await waitFor(() => expect(result.current.session.ready).toBe(true));
    expect(result.current.profile.profile).toBeNull();
    await act(() => result.current.profile.refresh());
    expect(result.current.profile.profile).toBeNull();
  });

  it("al entrar se carga el perfil de esa cuenta, y su id es el userId", async () => {
    const { result } = renderBoth(data);
    await waitFor(() => expect(result.current.session.ready).toBe(true));
    await act(() => result.current.session.login(DummyData.demoEmail, DummyData.demoPassword).then(() => undefined));
    await waitFor(() => expect(result.current.profile.profile?.fullName).toBe("Carlos Ruidíaz"));
    expect(result.current.profile.profile?.id).toBe("1");
  });

  it("al entrar otra cuenta, el perfil se recarga", async () => {
    const { result } = renderBoth(data);
    await waitFor(() => expect(result.current.session.ready).toBe(true));
    await act(() => result.current.session.login(DummyData.demoEmail, DummyData.demoPassword).then(() => undefined));
    await waitFor(() => expect(result.current.profile.profile?.id).toBe("1"));
    await act(() => result.current.session.logout().then(() => undefined));
    await act(() => result.current.session.login("ana.perez@uninorte.edu.co", DummyData.demoPassword).then(() => undefined));
    await waitFor(() => expect(result.current.profile.profile?.fullName).toBe("Ana Pérez"));
  });

  it("al cerrar sesion, el perfil se limpia", async () => {
    const { result } = renderBoth(data);
    await waitFor(() => expect(result.current.session.ready).toBe(true));
    await act(() => result.current.session.login(DummyData.demoEmail, DummyData.demoPassword).then(() => undefined));
    await waitFor(() => expect(result.current.profile.profile).not.toBeNull());
    await act(() => result.current.session.logout().then(() => undefined));
    expect(result.current.profile.profile).toBeNull();
  });
});
