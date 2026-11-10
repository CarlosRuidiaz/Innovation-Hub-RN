import { ApplicationMapper } from "@/src/features/application/data/mappers/ApplicationMapper";
import { ApplicationMessageMapper } from "@/src/features/application/data/mappers/ApplicationMessageMapper";
import { canWithdraw, isPending, newApplication } from "@/src/features/application/domain/entities/Application";

// La tabla `applications` contra `Application` de Flutter
// (`application_model_test.dart`). Lo esperado es lo que imprime `toJsonNoId`
// en Dart para los mismos datos.
describe("ApplicationMapper", () => {
  const application = newApplication({
    id: "a1",
    projectId: "p1",
    applicantId: "u7",
    applicantName: "Mariana Pérez",
    applicantProgram: "Diseño Industrial",
    applicantSemester: 7,
    skillsOffered: ["Diseño UX", "Investigación"],
    status: "removed",
    message: "Hola",
  });

  it("toNewRow escribe exactamente lo que toJsonNoId de Flutter, sin el mensaje", () => {
    expect(ApplicationMapper.toNewRow(application)).toStrictEqual({
      project_id: "p1",
      applicant_id: "u7",
      applicant_name: "Mariana Pérez",
      applicant_program: "Diseño Industrial",
      applicant_semester: 7,
      skills_offered: '["Diseño UX","Investigación"]',
      status: "removed",
    });
  });

  it("fromRow de una fila escrita por Flutter", () => {
    expect(
      ApplicationMapper.fromRow({
        _id: "a9",
        project_id: "p2",
        applicant_id: "u8",
        applicant_name: "Felipe Gómez",
        applicant_program: "Ing. de Sistemas",
        applicant_semester: "5",
        skills_offered: ["Desarrollo web"],
        status: "accepted",
      }),
    ).toEqual({
      id: "a9",
      projectId: "p2",
      applicantId: "u8",
      applicantName: "Felipe Gómez",
      applicantProgram: "Ing. de Sistemas",
      applicantSemester: 5,
      skillsOffered: ["Desarrollo web"],
      status: "accepted",
      message: null,
    });
  });

  it("fromRow con datos que faltan o vienen mal da los valores por omision de Flutter", () => {
    // `Application.fromJson` en Dart: null 0 [a, 1] pending.
    const a = ApplicationMapper.fromRow({ applicant_semester: "siete", skills_offered: '["a", 1]', status: "raro" });
    expect(a.id).toBeNull();
    expect(a.applicantSemester).toBe(0);
    expect(a.skillsOffered).toEqual(["a", "1"]);
    expect(a.status).toBe("pending");
    expect(a.projectId).toBe("");
  });

  it("ida y vuelta, con el mensaje que llega de su tabla", () => {
    expect(ApplicationMapper.fromRow({ _id: "a1", ...ApplicationMapper.toNewRow(application) }, "Hola")).toEqual(application);
  });

  it("solo una pendiente se puede retirar", () => {
    const pending = { ...application, status: "pending" as const };
    expect(isPending(pending)).toBe(true);
    expect(canWithdraw(pending)).toBe(true);
    expect(canWithdraw({ ...application, status: "accepted" })).toBe(false);
    expect(canWithdraw(application)).toBe(false);
  });

  it("el mensaje de la segunda fase arranca vacio", () => {
    const a = newApplication({ projectId: "p", applicantId: "u", applicantName: "", applicantProgram: "", applicantSemester: 1, skillsOffered: [] });
    expect(a.message).toBeNull();
    expect(a.status).toBe("pending");
  });
});

describe("ApplicationMessageMapper", () => {
  it("toNewRow es la fila de application_messages", () => {
    expect(ApplicationMessageMapper.toNewRow("a1", "Me interesa")).toStrictEqual({ application_id: "a1", message: "Me interesa" });
  });

  it("fromRow lee la fila; vacio es sin mensaje", () => {
    expect(ApplicationMessageMapper.fromRow({ _id: "m1", application_id: "a1", message: " Hola " })).toEqual({
      id: "m1",
      applicationId: "a1",
      message: "Hola",
    });
    expect(ApplicationMessageMapper.fromRow({ application_id: "a1", message: "  " }).message).toBeNull();
  });
});
