import { DummyData } from "@/src/core/data/dummyData";
import { Row } from "@/src/core/roble/guard";
import { ApplicationDataSource } from "@/src/features/application/data/datasources/ApplicationDataSource";
import { ApplicationInMemoryDataSource } from "@/src/features/application/data/datasources/ApplicationInMemoryDataSource";
import { ApplicationRepositoryImpl } from "@/src/features/application/data/repositories/ApplicationRepositoryImpl";
import { newApplication } from "@/src/features/application/domain/entities/Application";
import { fake } from "@/__tests__/support/fake";

const nueva = (projectId: string, applicantId = "u9") =>
  newApplication({
    projectId,
    applicantId,
    applicantName: "Nueva Persona",
    applicantProgram: "Psicología",
    applicantSemester: 3,
    skillsOffered: ["Investigación"],
  });

// `roble_application_source_test.dart`: lo que el repositorio le manda a la fuente.
describe("ApplicationRepository con una fuente falsa", () => {
  function sourceWith(rows: Row[], messages: Row[] = []) {
    const reads: Row[] = [];
    const created: Row[] = [];
    const createdMessages: Row[] = [];
    const updates: [string, Row][] = [];
    const source = fake<ApplicationDataSource>({
      readApplications: async (filters) => {
        reads.push(filters);
        return rows.filter((r) => Object.entries(filters).every(([k, v]) => r[k] === v));
      },
      readApplicationMessages: async () => messages,
      createApplication: async (row) => {
        created.push(row);
        return { ...row, _id: "nueva_1" };
      },
      createApplicationMessage: async (row) => {
        createdMessages.push(row);
        return { ...row, _id: "msg_1" };
      },
      updateApplication: async (id, changes) => {
        updates.push([id, changes]);
      },
    });
    return { repo: new ApplicationRepositoryImpl(source), reads, created, createdMessages, updates };
  }

  it("getMyApplications filtra por applicant_id y junta el mensaje", async () => {
    const { repo, reads } = sourceWith(
      [{ _id: "a1", project_id: "p1", applicant_id: "u1", status: "pending" }],
      [{ application_id: "a1", message: "Hola" }],
    );
    const apps = await repo.getMyApplications("u1");
    expect(reads).toEqual([{ applicant_id: "u1" }]);
    expect(apps.map((a) => [a.id, a.message])).toEqual([["a1", "Hola"]]);
  });

  it("getApplicationsFor filtra por project_id", async () => {
    const { repo, reads } = sourceWith([]);
    await repo.getApplicationsFor("p1");
    expect(reads).toEqual([{ project_id: "p1" }]);
  });

  it("apply devuelve la existente si ya hay una pendiente, aceptada o removida", async () => {
    for (const status of ["pending", "accepted", "removed"]) {
      const { repo, created } = sourceWith([{ _id: "a1", project_id: "p1", applicant_id: "u9", status }]);
      expect((await repo.apply(nueva("p1"))).id).toBe("a1");
      expect(created).toEqual([]);
    }
  });

  it("apply crea una nueva mandando skills_offered como texto JSON, y quien salio o se retiro puede volver", async () => {
    for (const status of ["left", "withdrawn", "rejected"]) {
      const { repo, created, createdMessages } = sourceWith([{ _id: "a1", project_id: "p1", applicant_id: "u9", status }]);
      const app = await repo.apply(nueva("p1"));
      expect(app.id).toBe("nueva_1");
      expect(created[0].skills_offered).toBe('["Investigación"]');
      expect(created[0].status).toBe("pending");
      expect(createdMessages).toEqual([]);
    }
  });

  it("el mensaje va en su propia tabla, recortado, solo si tiene algo", async () => {
    const { repo, created, createdMessages } = sourceWith([]);
    const app = await repo.apply({ ...nueva("p1"), message: "  Me interesa  " });
    expect(created[0]).not.toHaveProperty("message");
    expect(createdMessages).toEqual([{ application_id: "nueva_1", message: "Me interesa" }]);
    expect(app.message).toBe("Me interesa");
  });

  it("si el mensaje falla, la postulacion queda creada con message null", async () => {
    const { repo, created } = sourceWith([]);
    repo["source"].createApplicationMessage = async () => {
      throw new Error("fallo de roble");
    };
    const app = await repo.apply({ ...nueva("p1"), message: "Mensaje que fallara" });
    expect(created).toHaveLength(1);
    expect(app.id).toBe("nueva_1");
    expect(app.message).toBeNull();
  });

  it("withdraw, leave y decide actualizan unicamente status", async () => {
    const { repo, updates } = sourceWith([]);
    await repo.withdraw("a1");
    await repo.leave("a2");
    await repo.decide("a3", "accepted");
    await repo.decide("a4", "removed");
    expect(updates).toEqual([
      ["a1", { status: "withdrawn" }],
      ["a2", { status: "left" }],
      ["a3", { status: "accepted" }],
      ["a4", { status: "removed" }],
    ]);
  });
});

// `local_application_source_test.dart`, sobre los datos en memoria.
describe("ApplicationRepository en memoria", () => {
  let repo: ApplicationRepositoryImpl;

  beforeEach(() => {
    repo = new ApplicationRepositoryImpl(new ApplicationInMemoryDataSource(new DummyData({ latencyMs: 0 })));
  });

  it("getMyApplications y getApplicationsFor solo devuelven las pedidas", async () => {
    expect((await repo.getMyApplications("1")).map((a) => a.projectId).sort()).toEqual(["1", "3"]);
    expect((await repo.getApplicationsFor("2")).map((a) => a.applicantName)).toEqual(["Mariana Pérez", "Felipe Gómez"]);
  });

  it("apply asigna un id y la postulacion queda guardada", async () => {
    const app = await repo.apply(nueva("5"));
    expect(app.id).toBeTruthy();
    expect((await repo.getApplicationsFor("5")).map((a) => a.id)).toEqual([app.id]);
  });

  it("apply no crea una segunda viva, y devuelve la aceptada", async () => {
    const first = await repo.apply(nueva("5"));
    expect((await repo.apply(nueva("5"))).id).toBe(first.id);
    expect((await repo.apply(nueva("3", "1"))).status).toBe("accepted");
    expect(await repo.getApplicationsFor("5")).toHaveLength(1);
  });

  it("tras retirarse, o salir, se puede volver a postular", async () => {
    const first = await repo.apply(nueva("5"));
    await repo.withdraw(first.id!);
    const second = await repo.apply(nueva("5"));
    expect(second.id).not.toBe(first.id);
    await repo.leave(second.id!);
    expect((await repo.apply(nueva("5"))).id).not.toBe(second.id);
  });

  it("un removido no puede volver a postularse, pero si a otro proyecto", async () => {
    const first = await repo.apply(nueva("5"));
    await repo.decide(first.id!, "removed");
    const again = await repo.apply(nueva("5"));
    expect(again.id).toBe(first.id);
    expect(again.status).toBe("removed");
    expect((await repo.apply(nueva("6"))).id).not.toBe(first.id);
  });

  it("el mensaje sembrado llega a su postulacion", async () => {
    const [mariana] = await repo.getApplicationsFor("2");
    expect(mariana.message).toMatch(/^Me interesa/);
  });
});
