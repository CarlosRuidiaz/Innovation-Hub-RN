import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { Row } from "@/src/core/roble/guard";
import { Container } from "@/src/core/di/container";
import { DIProvider } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";
import { SessionProvider } from "@/src/features/auth/presentation/context/SessionContext";
import { FollowDataSource } from "@/src/features/follow/data/datasources/FollowDataSource";
import { FollowRepositoryImpl } from "@/src/features/follow/data/repositories/FollowRepositoryImpl";
import { FollowsProvider, useFollows } from "@/src/features/follow/presentation/context/FollowsContext";
import { fake } from "@/__tests__/support/fake";

// Kora: el conteo de seguidores de cada proyecto.
function memorySource(rows: Row[]) {
  const reads: Row[] = [];
  const source = fake<FollowDataSource>({
    readFollows: async (filters) => {
      reads.push(filters);
      return rows.filter((r) => Object.entries(filters).every(([k, v]) => r[k] === v));
    },
    createFollow: async (row) => {
      const stored = { ...row, _id: `f${rows.length + 1}` };
      rows.push(stored);
      return stored;
    },
    updateFollow: async (id, changes) => {
      Object.assign(rows.find((r) => r._id === id)!, changes);
    },
  });
  return { source, reads };
}

const seed = (): Row[] => [
  { _id: "f1", project_id: "p1", user_id: "u1", active: true },
  { _id: "f2", project_id: "p1", user_id: "u2", active: true },
  { _id: "f3", project_id: "p1", user_id: "u3", active: false },
  { _id: "f4", project_id: "p2", user_id: "u2", active: true },
];

describe("countFollowers", () => {
  it("cuenta los seguidores activos de cada proyecto con una sola lectura", async () => {
    const { source, reads } = memorySource(seed());
    const counts = await new FollowRepositoryImpl(source).countFollowers();
    expect(counts).toEqual({ p1: 2, p2: 1 });
    expect(reads).toEqual([{ active: true }]);
  });
});

describe("FollowsContext con los conteos", () => {
  function renderFollows() {
    const { source } = memorySource(seed());
    const auth = fake<AuthRepository>({
      restoreSession: async () => ({ userId: "u9", email: "u9@uninorte.edu.co", name: "Nueve" }),
      onSessionExpired: () => () => {},
    });
    const container = new Container()
      .register(TOKENS.AuthRepo, auth)
      .register(TOKENS.FollowRepo, new FollowRepositoryImpl(source));
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>
        <SessionProvider>
          <FollowsProvider>{children}</FollowsProvider>
        </SessionProvider>
      </DIProvider>
    );
    return renderHook(() => useFollows(), { wrapper });
  }

  it("carga los conteos al entrar, y suben y bajan al seguir y dejar de seguir", async () => {
    const { result } = renderFollows();
    await waitFor(() => expect(result.current.followersOf("p1")).toBe(2));
    expect(result.current.followersOf("p3")).toBe(0);

    await act(async () => {
      await result.current.toggleFollow("p1", true);
    });
    expect(result.current.followersOf("p1")).toBe(3);

    // Seguir otra vez lo que ya sigue no cuenta doble.
    await act(async () => {
      await result.current.toggleFollow("p1", true);
    });
    expect(result.current.followersOf("p1")).toBe(3);

    await act(async () => {
      await result.current.toggleFollow("p1", false);
    });
    expect(result.current.followersOf("p1")).toBe(2);
  });

  it("recargar vuelve a leer los conteos", async () => {
    const { result } = renderFollows();
    await waitFor(() => expect(result.current.followersOf("p2")).toBe(1));
    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.followersOf("p2")).toBe(1);
  });
});
