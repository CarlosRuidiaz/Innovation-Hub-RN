import { INSTITUTIONAL_DOMAIN, isInstitutionalEmail } from "../domain/entities/AppUser";

// Los `validator` de los campos de login y registro en Flutter, con sus textos.

export function emailError(value: string): string | null {
  if (!value.trim()) return "Escribe tu correo";
  if (!isInstitutionalEmail(value)) return `Usa tu correo ${INSTITUTIONAL_DOMAIN}`;
  return null;
}

export function passwordError(value: string): string | null {
  return value.length < 7 ? "Debe tener al menos 7 caracteres" : null;
}

export const EMAIL_HINT = `tunombre${INSTITUTIONAL_DOMAIN}`;
