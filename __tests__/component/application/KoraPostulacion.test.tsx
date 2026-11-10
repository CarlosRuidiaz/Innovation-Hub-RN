import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { DummyData } from "@/src/core/data/dummyData";
import { Container } from "@/src/core/di/container";
import { createLocalContainer } from "@/src/core/di/localContainer";
import { TOKENS } from "@/src/core/di/tokens";
import { ApplicationRepository } from "@/src/features/application/domain/repositories/ApplicationRepository";
import { ApplicationAction } from "@/src/features/application/presentation/components/ApplicationAction";
import { ApplySheet } from "@/src/features/application/presentation/components/ApplySheet";
import ApplicationStatusScreen from "@/src/features/application/presentation/screens/ApplicationStatusScreen";
import ApplicantsScreen from "@/src/features/management/presentation/screens/ApplicantsScreen";
import MyProjectsScreen from "@/src/features/myProjects/presentation/screens/MyProjectsScreen";
import { ProjectRepository } from "@/src/features/project/domain/repositories/ProjectRepository";
import ProjectDetailScreen from "@/src/features/project/presentation/screens/ProjectDetailScreen";
import { renderScreen } from "@/__tests__/support/renderScreen";

// Kora: postularse con aportes y mensaje, el mensaje en la gestion y las
// postulaciones en revision. Con los datos en memoria.
function as(email: string) {
  const data = new DummyData({ latencyMs: 0 });
  data.session = data.users.find((u) => u.email === email)!;
  return { data, container: createLocalContainer(data) };
}

const project2 = async (container: Container) =>
  (await container.resolve<ProjectRepository>(TOKENS.ProjectRepo).getProjects()).find((p) => p.id === "2")!;

// Ana abre el detalle del proyecto 2 (busca Desarrollo web y Gestion; ella
// tiene Desarrollo web) y abre la hoja.
async function openSheet(container: Container) {
  renderScreen(ProjectDetailScreen, container, {
    params: { project: await project2(container) },
    routes: { ApplicationStatus: ApplicationStatusScreen },
  });
  await waitFor(() =>
    expect(screen.getByTestId(ApplicationAction.applyButtonKey).props.accessibilityState?.disabled).toBeFalsy(),
  );
  fireEvent.press(screen.getByTestId(ApplicationAction.applyButtonKey));
  await screen.findByTestId(ApplySheet.key);
}

const sendDisabled = () => screen.getByTestId(ApplySheet.submitButtonKey).props.accessibilityState?.disabled;

describe("la hoja para postularse", () => {
  it("marca las que coinciden, no deja enviar sin ninguna y el mensaje tiene tope de 280", async () => {
    const { container } = as("ana.perez@uninorte.edu.co");
    await openSheet(container);
    expect(screen.getByText("✓ Desarrollo web")).toBeTruthy();
    expect(screen.getByTestId("SkillChip_Gestión").props.accessibilityState?.checked).toBe(false);
    expect(sendDisabled()).toBe(false);
    fireEvent.press(screen.getByTestId("SkillChip_Desarrollo web"));
    expect(sendDisabled()).toBe(true);
    expect(screen.getByTestId(ApplySheet.messageFieldKey).props.maxLength).toBe(280);
  });

  it("skills_offered lleva solo lo marcado, y el mensaje va a application_messages", async () => {
    const { data, container } = as("ana.perez@uninorte.edu.co");
    await openSheet(container);
    fireEvent.changeText(screen.getByTestId(ApplySheet.messageFieldKey), "  Hice monitorías de web  ");
    fireEvent.press(screen.getByTestId(ApplySheet.submitButtonKey));
    expect(await screen.findByTestId(ApplicationStatusScreen.key)).toBeTruthy();
    const row = data.applications.at(-1)!;
    expect(row).toMatchObject({ project_id: "2", applicant_id: "u_ana", skills_offered: '["Desarrollo web"]', status: "pending" });
    expect(row).not.toHaveProperty("message");
    expect(data.applicationMessages.at(-1)).toMatchObject({ application_id: row._id, message: "Hice monitorías de web" });
  });

  it("sin mensaje no escribe nada en application_messages", async () => {
    const { data, container } = as("ana.perez@uninorte.edu.co");
    const before = data.applicationMessages.length;
    await openSheet(container);
    fireEvent.press(screen.getByTestId(ApplySheet.submitButtonKey));
    expect(await screen.findByTestId(ApplicationStatusScreen.key)).toBeTruthy();
    expect(data.applicationMessages).toHaveLength(before);
  });

  it("si el mensaje falla, la postulacion queda enviada y se avisa", async () => {
    const { data, container } = as("ana.perez@uninorte.edu.co");
    const real = container.resolve<ApplicationRepository>(TOKENS.ApplicationRepo);
    container.register<ApplicationRepository>(
      TOKENS.ApplicationRepo,
      new Proxy(real, {
        get: (target, prop, receiver) =>
          prop === "apply"
            ? async (a: Parameters<ApplicationRepository["apply"]>[0]) => ({ ...(await target.apply({ ...a, message: null })), message: null })
            : Reflect.get(target, prop, receiver),
      }),
    );
    await openSheet(container);
    fireEvent.changeText(screen.getByTestId(ApplySheet.messageFieldKey), "Quiero unirme");
    fireEvent.press(screen.getByTestId(ApplySheet.submitButtonKey));
    expect(await screen.findByText("Tu postulación se envió, pero no el mensaje.")).toBeTruthy();
    expect(data.applications.at(-1)).toMatchObject({ applicant_id: "u_ana", status: "pending" });
  });
});

describe("el mensaje en la gestion de postulantes", () => {
  it("se ve el mensaje cuando existe, y los botones aceptan y rechazan", async () => {
    const { data, container } = as(DummyData.demoEmail);
    renderScreen(ApplicantsScreen, container, { params: { project: await project2(container) } });
    expect(await screen.findByText(/Me interesa porque di monitorías de Cálculo/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Aceptar a Mariana Pérez"));
    await waitFor(() => expect(data.applications.find((a) => a._id === "1")!.status).toBe("accepted"));
    fireEvent.press(screen.getByLabelText("Rechazar a Felipe Gómez"));
    await waitFor(() => expect(data.applications.find((a) => a._id === "2")!.status).toBe("rejected"));
  });
});

describe("las postulaciones en Donde participo", () => {
  it("agrupa pendientes y rechazadas con su etiqueta, sin las retiradas, y abre el estado", async () => {
    const { data, container } = as(DummyData.demoEmail);
    const base = { applicant_id: "1", applicant_name: "Carlos Ruidíaz", applicant_program: "Ing. de Sistemas", applicant_semester: 8, skills_offered: '["Diseño UX"]' };
    data.applications.push(
      { ...base, _id: "r1", project_id: "5", status: "rejected" },
      { ...base, _id: "w1", project_id: "6", status: "withdrawn" },
    );
    const titleOf = (id: string) => String(data.projects.find((p) => p._id === id)!.title);
    renderScreen(MyProjectsScreen, container, { routes: { ApplicationStatus: ApplicationStatusScreen } });
    fireEvent.press(await screen.findByTestId("TabParticipo"));
    expect(await screen.findByText("TUS POSTULACIONES · 1 EN REVISIÓN")).toBeTruthy();
    expect(screen.getByText("EN REVISIÓN")).toBeTruthy();
    expect(screen.getByText("NO ACEPTADA")).toBeTruthy();
    expect(screen.queryByLabelText(`Postulación a ${titleOf("6")}`)).toBeNull();
    expect(screen.getByText("TUS EQUIPOS")).toBeTruthy();
    fireEvent.press(screen.getByLabelText(`Postulación a ${titleOf("1")}`));
    expect(await screen.findByTestId(ApplicationStatusScreen.key)).toBeTruthy();
  });
});
