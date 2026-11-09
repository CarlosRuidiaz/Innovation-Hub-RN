import { Project } from "@/src/features/project/domain/entities/Project";

// Reemplaza la parte de `_buildFooterButtons` en `project_detail_page.dart`
// que depende de la postulacion del estudiante. La pone el pie del detalle del
// proyecto, junto a `FollowButton`.
//
// Lo completa el carril 2. Tiene que mostrar una de tres cosas:
// - "Ver mi postulación" si hay una viva (pendiente o aceptada): abre
//   `ApplicationStatus` con esa postulacion.
// - "Te removieron de este proyecto." si el lider lo saco: no puede volver a
//   postularse.
// - "Postularme" si `acceptsApplicationsFrom(project, perfil.id)`: crea la
//   postulacion con los datos del perfil y abre `ApplicationStatus`. Sin
//   perfil cargado, el boton se ve deshabilitado.
// Si no toca ninguna, nada.
//
// Por ahora no muestra nada.
export function ApplicationAction({ project }: { project: Project }) {
  return null;
}
