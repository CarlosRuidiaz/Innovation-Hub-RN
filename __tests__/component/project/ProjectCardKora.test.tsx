import { screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { DummyData } from "@/src/core/data/dummyData";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { ProjectCounters } from "@/src/features/follow/presentation/components/ProjectCounters";
import { CompactProjectCard } from "@/src/features/myProjects/presentation/components/CompactProjectCard";
import { newProject, Project } from "@/src/features/project/domain/entities/Project";
import { ProjectCard } from "@/src/features/project/presentation/components/ProjectCard";
import { renderScreen } from "@/__tests__/support/renderScreen";

// Kora: las tarjetas con el icono del tipo y los contadores.
const project = (fields: Partial<Project> = {}) =>
  newProject({
    id: "p1",
    title: "Huerta en la terraza",
    problem: "P",
    description: "D",
    stage: "idea",
    academicProgram: "Diseño Industrial",
    currentMembers: 3,
    maxMembers: 5,
    skillsWanted: ["Python", "Diseño UX"],
    leaderId: "u9",
    ...fields,
  });

// Los datos en memoria con dos seguidores del proyecto "p1".
function container() {
  const data = new DummyData({ latencyMs: 0 });
  data.session = data.users.find((u) => u.email === DummyData.demoEmail)!;
  data.follows.push(
    { _id: "k1", project_id: "p1", user_id: "u7", active: true },
    { _id: "k2", project_id: "p1", user_id: "u8", active: true },
  );
  return createLocalContainer(data);
}

function renderCard(p: Project) {
  const Screen = () => <ProjectCard project={p} testID={ProjectCard.keyFor(p)} />;
  return renderScreen(Screen, container());
}

describe("ProjectCard de Kora", () => {
  it("muestra el icono del tipo, y el de Otros cuando no tiene", async () => {
    renderCard(project({ innovationType: "ambiental" }));
    expect(await screen.findByLabelText("Ambiental")).toBeTruthy();
    screen.unmount();
    renderCard(project({ innovationType: null }));
    expect(await screen.findByLabelText("Otros")).toBeTruthy();
  });

  it("los contadores muestran miembros y seguidores, con su etiqueta", async () => {
    renderCard(project());
    const members = await screen.findByTestId(ProjectCounters.membersKeyFor("p1"));
    expect(members.props.accessibilityLabel).toBe("3 de 5 miembros");
    expect(screen.getByText("3/5")).toBeTruthy();
    const followers = screen.getByTestId(ProjectCounters.followersKeyFor("p1"));
    await waitFor(() => expect(followers.props.accessibilityLabel).toBe("2 personas siguen este proyecto"));
  });

  it("la etapa va junto al programa y las reglas de Busca no cambian", async () => {
    renderCard(project());
    expect(await screen.findByText("Diseño Industrial")).toBeTruthy();
    expect(screen.getByText("Idea")).toBeTruthy();
    expect(screen.getByText("Busca: Python · Diseño UX")).toBeTruthy();
    screen.unmount();
    renderCard(project({ currentMembers: 5 }));
    expect(await screen.findByText("Equipo completo · reclutamiento cerrado")).toBeTruthy();
    screen.unmount();
    renderCard(project({ recruitmentOpen: false }));
    expect(await screen.findByText("Reclutamiento cerrado")).toBeTruthy();
  });

  it("la tarjeta compacta lleva el mismo icono y contadores", async () => {
    const Screen = () => <CompactProjectCard project={project({ innovationType: "social" })} />;
    renderScreen(Screen, container());
    expect(await screen.findByLabelText("Social")).toBeTruthy();
    expect(screen.getByText("3/5")).toBeTruthy();
    expect(screen.getByText("Diseño Industrial")).toBeTruthy();
  });
});
