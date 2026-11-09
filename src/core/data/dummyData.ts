import { AppCatalogs } from "../catalogs";
import { Row, toFlutterIso } from "../roble/guard";

// El backend falso: las mismas filas que devolveria Roble, en memoria.
//
// Guarda **filas**, no entidades, y esa es la gracia: los datasources en
// memoria devuelven lo mismo que los de Roble, asi que el repositorio, que es
// uno solo, hace el mismo trabajo en los dos casos. Las filas estan escritas
// como las escribe Flutter (`toJsonNoId`): las listas como texto JSON, las
// etapas y los estados con su nombre, las fechas en hora local sin zona.
//
// Los datos salen de las fuentes locales de Flutter (`local_*_source.dart`) y
// de sus pruebas. Se pierde al cerrar la app: existe para trabajar en la UI sin
// servidor y para que las pruebas no necesiten red. Cada prueba crea uno nuevo.
export class DummyData {
  // La cuenta con la que arranca la demo: el perfil de `local_profile_source.dart`.
  static readonly demoEmail = "carlos.ruidiaz@uninorte.edu.co";
  // Todas las cuentas sembradas tienen la misma, y cumple las reglas del registro.
  static readonly demoPassword = "Clave!2026";

  // Lo que devuelve `currentUser()` de Roble para cada cuenta: el perfil viaja
  // en `extra`, porque no tiene tabla propia.
  users: Row[] = [];
  passwords: Record<string, string> = {};

  // Las diez tablas de Flutter.
  projects: Row[] = [];
  applications: Row[] = [];
  follows: Row[] = [];
  milestones: Row[] = [];
  progressUpdates: Row[] = [];
  tasks: Row[] = [];
  polls: Row[] = [];
  pollResponses: Row[] = [];
  comments: Row[] = [];
  feedback: Row[] = [];

  // Las dos de la segunda fase.
  projectTypes: Row[] = [];
  applicationMessages: Row[] = [];

  // Quien tiene la sesion abierta, o `null`.
  session: Row | null = null;

  // Latencia simulada, para que los estados de carga se vean. Las pruebas la
  // bajan: en Jest los relojes son de verdad.
  readonly latencyMs: number;

  // Arranca por encima de los ids sembrados a mano: si volviera a emitirlos,
  // una fila nueva pisaria una de prueba.
  private counter = 100;
  nextId(prefix: string) {
    this.counter += 1;
    return `${prefix}_${this.counter}`;
  }

  constructor({ latencyMs = 300 }: { latencyMs?: number } = {}) {
    this.latencyMs = latencyMs;
    this.seed();
  }

  // Espera la latencia simulada, escalada para cada tipo de llamada.
  delay(factor = 1) {
    return new Promise<void>((resolve) => setTimeout(resolve, this.latencyMs * factor));
  }

  private at(offsetMs: number) {
    return toFlutterIso(new Date(Date.now() + offsetMs));
  }

  private seed() {
    const hour = 3600_000;
    const day = 24 * hour;
    const list = (values: string[]) => JSON.stringify(values);

    this.users.push(
      {
        userId: "1",
        email: DummyData.demoEmail,
        name: "Carlos Ruidíaz",
        role: "user",
        extra: {
          academicProgram: AppCatalogs.programSystems,
          semester: 8,
          skills: [AppCatalogs.skillResearch, AppCatalogs.skillUx],
        },
      },
      {
        userId: "u7",
        email: "mariana.perez@uninorte.edu.co",
        name: "Mariana Pérez",
        role: "user",
        extra: {
          academicProgram: AppCatalogs.programIndustrialDesign,
          semester: 7,
          skills: [AppCatalogs.skillUx, AppCatalogs.skillResearch],
        },
      },
      {
        userId: "u8",
        email: "felipe.gomez@uninorte.edu.co",
        name: "Felipe Gómez",
        role: "user",
        extra: {
          academicProgram: AppCatalogs.programSystems,
          semester: 5,
          skills: [AppCatalogs.skillWeb, AppCatalogs.skillManagement],
        },
      },
      // La cuenta de `login_test.dart` y `crear_usuario_test.dart`.
      {
        userId: "u_ana",
        email: "ana.perez@uninorte.edu.co",
        name: "Ana Pérez",
        role: "user",
        extra: {
          academicProgram: AppCatalogs.programSystems,
          semester: 5,
          skills: [AppCatalogs.skillWeb],
        },
      },
    );
    for (const u of this.users) this.passwords[u.email] = DummyData.demoPassword;

    // `local_project_source.dart`, en el mismo orden.
    this.projects.push(
      {
        _id: "1",
        title: "App de movilidad sostenible",
        problem:
          "Los estudiantes que viven lejos del campus pierden hasta dos horas diarias en transporte y no tienen forma de coordinarse entre ellos.",
        description:
          "Una app que arma rutas compartidas entre estudiantes que salen del mismo sector a la misma hora, con estimacion de huella de carbono.",
        stage: "research",
        academic_program: AppCatalogs.programArchitecture,
        current_members: 4,
        max_members: 6,
        skills_wanted: list([AppCatalogs.skillData, AppCatalogs.skillUx]),
        tags: list([AppCatalogs.tagSustainability, AppCatalogs.tagTechnology]),
        leader_id: "u3",
        recruitment_open: true,
      },
      {
        // El perfil de la demo es el lider: por eso puede abrir los postulantes.
        _id: "2",
        title: "Plataforma de tutorías entre pares",
        problem:
          "Las materias de primer semestre tienen alta deserción y las monitorías oficiales no alcanzan para todos los que las piden.",
        description:
          "Un espacio donde un estudiante de semestres avanzados ofrece tutorías en una materia y quien la necesita reserva un horario.",
        stage: "idea",
        academic_program: AppCatalogs.programSystems,
        current_members: 2,
        max_members: 4,
        skills_wanted: list([AppCatalogs.skillWeb, AppCatalogs.skillManagement]),
        tags: list([AppCatalogs.tagEducation, AppCatalogs.tagTutoring]),
        leader_id: "1",
        recruitment_open: true,
      },
      {
        _id: "3",
        title: "Dispositivo IoT para monitoreo de agua",
        problem:
          "Los laboratorios no saben si el agua de los tanques cumple los parámetros hasta que llega el informe de laboratorio, una semana después.",
        description:
          "Un sensor de bajo costo que mide pH y turbidez cada hora y publica la lectura en un tablero que cualquiera puede consultar.",
        stage: "prototype",
        academic_program: AppCatalogs.programSystems,
        current_members: 3,
        max_members: 5,
        skills_wanted: list([AppCatalogs.skillPython, AppCatalogs.skillData]),
        tags: list([AppCatalogs.tagTechnology, AppCatalogs.tagSocial]),
        leader_id: "u5",
        recruitment_open: true,
      },
      {
        // Equipo lleno: `isFull` y `acceptsApplications` en falso.
        _id: "4",
        title: "Red comunitaria de reciclaje textil",
        problem:
          "La ropa que los estudiantes dejan de usar termina en la basura porque no hay un punto de acopio ni quien la redistribuya.",
        description:
          "Una red de puntos de acopio en el campus con un inventario compartido y jornadas de intercambio cada mes.",
        stage: "teamFormation",
        academic_program: AppCatalogs.programIndustrialDesign,
        current_members: 5,
        max_members: 5,
        skills_wanted: list([AppCatalogs.skillManagement, AppCatalogs.skillMarketing]),
        tags: list([AppCatalogs.tagSustainability, AppCatalogs.tagCommunity]),
        leader_id: "u2",
        recruitment_open: true,
      },
      {
        // Sin habilidades pedidas: la tarjeta no pinta la linea.
        _id: "5",
        title: "Sistema de alertas para emergencias en campus",
        problem:
          "Ante una emergencia no hay un canal único: la información llega tarde, por WhatsApp y sin instrucciones claras.",
        description:
          "Una alerta que llega al celular con el tipo de emergencia, el punto de encuentro y la ruta de evacuación más cercana.",
        stage: "testing",
        academic_program: AppCatalogs.programBusiness,
        current_members: 2,
        max_members: 4,
        skills_wanted: list([]),
        tags: list([AppCatalogs.tagSocial]),
        leader_id: "u4",
        recruitment_open: true,
      },
      {
        // Proyecto terminado: ya no recibe postulaciones.
        _id: "6",
        title: "Biblioteca digital accesible",
        problem:
          "Los estudiantes con baja visión no pueden usar el repositorio de la universidad: los PDF escaneados no los lee ningún lector de pantalla.",
        description:
          "Un catálogo con los textos convertidos a formato accesible, navegable por voz y con contraste ajustable.",
        stage: "finished",
        academic_program: AppCatalogs.programPsychology,
        current_members: 3,
        max_members: 4,
        skills_wanted: list([AppCatalogs.skillUx, AppCatalogs.skillResearch]),
        tags: list([AppCatalogs.tagEducation, AppCatalogs.tagSocial]),
        leader_id: "u6",
        recruitment_open: false,
      },
    );

    // `local_application_source.dart`.
    this.applications.push(
      {
        _id: "1",
        project_id: "2",
        applicant_id: "u7",
        applicant_name: "Mariana Pérez",
        applicant_program: AppCatalogs.programIndustrialDesign,
        applicant_semester: 7,
        skills_offered: list([AppCatalogs.skillUx, AppCatalogs.skillResearch]),
        status: "pending",
      },
      {
        _id: "2",
        project_id: "2",
        applicant_id: "u8",
        applicant_name: "Felipe Gómez",
        applicant_program: AppCatalogs.programSystems,
        applicant_semester: 5,
        skills_offered: list([AppCatalogs.skillWeb, AppCatalogs.skillManagement]),
        status: "pending",
      },
      {
        _id: "3",
        project_id: "1",
        applicant_id: "1",
        applicant_name: "Carlos Ruidíaz",
        applicant_program: AppCatalogs.programSystems,
        applicant_semester: 8,
        skills_offered: list([AppCatalogs.skillUx]),
        status: "pending",
      },
      {
        _id: "4",
        project_id: "3",
        applicant_id: "1",
        applicant_name: "Carlos Ruidíaz",
        applicant_program: AppCatalogs.programSystems,
        applicant_semester: 8,
        skills_offered: list([AppCatalogs.skillResearch]),
        status: "accepted",
      },
    );

    // `local_follow_source.dart`.
    this.follows.push({ _id: "f1", project_id: "2", user_id: "u8", active: true });

    // En Flutter el espacio de trabajo, las encuestas y la vitrina arrancan
    // vacios. Aqui llevan unas filas sobre el proyecto 3, el prototipo donde la
    // cuenta de la demo es miembro, para que esas pantallas se vean con datos.
    this.milestones.push(
      { _id: "m1", project_id: "3", title: "Prototipo del sensor", due_date: this.at(-10 * day), done: true },
      { _id: "m2", project_id: "3", title: "Tablero de lecturas", due_date: this.at(7 * day), done: false },
      { _id: "m3", project_id: "3", title: "Pruebas en el laboratorio", due_date: this.at(21 * day), done: false },
    );

    this.progressUpdates.push({
      _id: "pu1",
      project_id: "3",
      author_id: "1",
      author_name: "Carlos Ruidíaz",
      title: "Primer prototipo del sensor",
      description: "El sensor ya mide pH y turbidez cada hora y guarda las lecturas en la tarjeta.",
      created_at: this.at(-9 * day),
      completion_percentage: 33,
      video_url: "",
      milestone_id: "m1",
    });

    this.tasks.push(
      { _id: "t1", project_id: "3", title: "Calibrar el sensor de pH", assignee_name: "Carlos Ruidíaz", done: true },
      { _id: "t2", project_id: "3", title: "Diseñar el tablero", assignee_name: "Carlos Ruidíaz", done: false },
    );

    this.polls.push({
      _id: "poll1",
      project_id: "3",
      author_id: "u5",
      title: "Encuesta del tablero",
      description: "Queremos saber qué lectura consultarías más.",
      questions: JSON.stringify([{ text: "¿Qué lectura te sirve más?", options: ["pH", "Turbidez", "Las dos"] }]),
      closes_at: this.at(5 * day),
      audience_program: "",
    });

    this.pollResponses.push({ _id: "pr1", poll_id: "poll1", respondent_id: "u8", answers: JSON.stringify([2]), comment: "" });

    this.comments.push(
      {
        _id: "c1",
        project_id: "3",
        author_id: "u7",
        author_name: "Mariana Pérez",
        text: "Excelente propuesta. ¿El tablero se puede ver desde el celular?",
        is_team: false,
        created_at: this.at(-3 * day),
      },
      {
        _id: "c2",
        project_id: "3",
        author_id: "1",
        author_name: "Carlos Ruidíaz",
        text: "Sí, la idea es que funcione en cualquier navegador.",
        parent_id: "c1",
        is_team: true,
        created_at: this.at(-2 * day),
      },
    );

    this.feedback.push({
      _id: "fb1",
      project_id: "3",
      author_id: "u8",
      author_name: "Felipe Gómez",
      usability: 4,
      innovation: 5,
      visual_design: 4,
      feasibility: 3,
      comment: "Muy buena idea de diseño.",
      created_at: this.at(-1 * day),
    });

    // Segunda fase: el tipo de algunos proyectos y el mensaje de una
    // postulacion. Los que no tienen fila se ven como "Otros" y sin mensaje.
    this.projectTypes.push(
      { _id: "pt1", project_id: "1", innovation_type: "ambiental" },
      { _id: "pt2", project_id: "3", innovation_type: "tecnologica" },
      { _id: "pt3", project_id: "6", innovation_type: "educativa" },
    );

    this.applicationMessages.push({
      _id: "am1",
      application_id: "1",
      message: "Me interesa porque di monitorías de Cálculo dos semestres y sé dónde se traban los de primero.",
    });
  }
}

// Filtra filas por igualdad, como `db.read(tabla, filtros)`. Roble compara como
// texto, asi que aqui tambien: `{ done: true }` encuentra un `"true"`.
export function matchesRow(row: Row, filters?: Row) {
  return !filters || Object.entries(filters).every(([k, v]) => String(row[k]) === String(v));
}
