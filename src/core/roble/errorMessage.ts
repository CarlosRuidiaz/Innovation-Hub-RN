import {
  RobleApiAuthException,
  RobleApiException,
  RobleApiFormatException,
  RobleApiHttpException,
  RobleApiNetworkException,
  RobleApiTimeoutException,
} from "roble-client";

// Traduce una excepcion a algo que se le pueda enseñar a una persona: el
// `errorMessage` de `lib/core/error_message.dart`, con los mismos textos.
//
// Las de Roble se reconocen de la mas especifica a la base. El orden importa:
// las de HTTP heredan unas de otras, asi que comprobar la base primero se
// tragaria los casos concretos.
export function errorMessage(error: unknown, fallback?: string): string {
  if (error instanceof RobleApiNetworkException) {
    return "No hay conexion. Revisa tu internet e intentalo de nuevo.";
  }
  if (error instanceof RobleApiTimeoutException) {
    return "El servidor tardo demasiado en responder. Intentalo de nuevo.";
  }
  // Sin sesion, o la renovacion del token fallo.
  if (error instanceof RobleApiAuthException) {
    return "Tu sesion expiro. Vuelve a entrar.";
  }
  if (error instanceof RobleApiHttpException) {
    switch (error.statusCode) {
      case 400:
        return "Los datos enviados no son validos. Revisalos e intentalo de nuevo.";
      case 401:
        return "Correo o contrasena incorrectos.";
      case 403:
        return "No tienes permiso para hacer eso.";
      case 404:
        return "No encontramos lo que buscabas.";
      case 409:
        return "Ese correo ya esta registrado. Entra con el o usa otro.";
      default:
        return error.statusCode >= 500
          ? "El servidor tuvo un problema. Intentalo mas tarde."
          : "No se pudo completar la operacion. Intentalo de nuevo.";
    }
  }
  // La respuesta no tenia la forma esperada: no es culpa de quien la ve.
  if (error instanceof RobleApiFormatException) {
    return "El servidor respondio algo inesperado. Intentalo de nuevo.";
  }
  if (error instanceof RobleApiException) {
    return "No se pudo completar la operacion. Intentalo de nuevo.";
  }
  return fallback ?? "Ocurrio un error inesperado. Intentalo de nuevo.";
}
