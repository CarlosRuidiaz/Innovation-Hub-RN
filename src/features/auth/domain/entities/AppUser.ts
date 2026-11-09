// Quien tiene la sesion: el `AuthenticationUser` de Flutter sin la contraseña.
//
// `userId` es el del usuario en Roble (el que referencian las tablas), no el
// `id` de la fila del perfil.
export type AppUser = {
  userId: string;
  email: string;
  name: string;
};

// Lo que pide el registro en dos pasos: las credenciales del paso 1 y el
// perfil del paso 2. El perfil viaja en el `extra` de la cuenta.
export type SignUpData = {
  email: string;
  password: string;
  name: string;
  academicProgram: string;
  semester: number;
  skills: string[];
  // Opcional: el perfil vale sin ella.
  bio?: string | null;
};

// El enunciado pide credenciales institucionales: solo correos de la
// universidad entran.
export const INSTITUTIONAL_DOMAIN = "@uninorte.edu.co";

// Verdadero si el correo es institucional, sin distinguir mayusculas ni
// espacios de sobra. Se comprueba antes de salir a la red: el servidor lo
// aceptaria igual y habria cuentas que no deberian existir.
export const isInstitutionalEmail = (email: string) => email.trim().toLowerCase().endsWith(INSTITUTIONAL_DOMAIN);
