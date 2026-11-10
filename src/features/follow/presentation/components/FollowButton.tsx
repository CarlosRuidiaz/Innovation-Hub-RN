import React, { useState } from "react";

import { SecondaryButton } from "@/src/core/components/Buttons";
import { useFollows } from "@/src/features/follow/presentation/context/FollowsContext";
import { Project } from "@/src/features/project/domain/entities/Project";

// El boton "Seguir" / "Siguiendo" del pie del detalle de un proyecto.
// Reemplaza la parte de `_buildFooterButtons` que toca `FollowController`.
// Solo se muestra si quien mira no es el lider; ese filtro lo hace el detalle.
export function FollowButton({ project }: { project: Project }) {
  const { isFollowing, toggleFollow } = useFollows();
  const [loading, setLoading] = useState(false);
  const projectId = project.id ?? "";
  const following = isFollowing(projectId);

  async function handlePress() {
    setLoading(true);
    try {
      await toggleFollow(projectId, !following);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SecondaryButton
      testID="ButtonFollow"
      label={following ? "Siguiendo" : "Seguir"}
      onPress={handlePress}
      loading={loading}
    />
  );
}
