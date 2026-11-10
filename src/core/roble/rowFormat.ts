import { Row } from "./guard";

// Como lee y escribe Flutter cada tipo de columna, en un solo sitio.
//
// La app Flutter sigue en uso sobre las mismas tablas, asi que los
// convertidores de filas tienen que leer lo que ella escribe y escribir lo que
// ella lee. Cada funcion dice a que linea de Dart equivale.

// `(json['_id'] ?? json['id'])?.toString()`
export function idOf(row: Row): string | null {
  const id = row._id ?? row.id;
  return id == null ? null : String(id);
}

// `json['x']?.toString() ?? ''`
export function textOf(value: unknown): string {
  return value == null ? "" : String(value);
}

// `int.tryParse(x?.toString() ?? '') ?? fallback`. Dart acepta espacios
// alrededor, el signo y `0x`; un decimal como "4.5" no es un entero y da el
// valor por omision.
export function intOf(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isInteger(value) ? value : fallback;
  if (value == null || typeof value === "boolean") return fallback;
  const text = String(value).trim();
  if (/^[+-]?\d+$/.test(text)) return parseInt(text, 10);
  const hex = /^([+-]?)0x([0-9a-f]+)$/i.exec(text);
  if (hex) return (hex[1] === "-" ? -1 : 1) * parseInt(hex[2], 16);
  return fallback;
}

// `value is bool ? value : value.toString().toLowerCase() == 'true'`. Lo que
// cambia entre tablas es que da una columna nula: `recruitment_open` y `active`
// valen `true`, `done` e `is_team` valen `false`.
export function boolOf(value: unknown, whenNull = false): boolean {
  if (value == null) return whenNull;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

// `_parseList` de los modelos: una lista, o un texto JSON con una lista (asi la
// escribe Flutter, con `jsonEncode`). Cualquier otra cosa es una lista vacia.
export function listOf(value: unknown): string[] {
  const items = rawListOf(value);
  return items.map((e) => String(e));
}

// La lista sin convertir sus elementos: las preguntas de una encuesta son
// objetos y las respuestas, numeros.
export function rawListOf(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const decoded = JSON.parse(trimmed);
      if (Array.isArray(decoded)) return decoded;
    } catch {
      // Texto que no es JSON: lista vacia, como en Flutter.
    }
  }
  return [];
}

// La expresion de `DateTime.parse` de Dart: fecha, hora opcional con fraccion
// y zona opcional.
const DART_DATE =
  /^([+-]?\d{4,6})-?(\d\d)-?(\d\d)(?:[ T](\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d+))?)?)?( ?[zZ]| ?([-+])(\d\d)(?::?(\d\d))?)?)?$/;

// `DateTime.tryParse`. Lee lo que escribe Flutter (hora local sin zona y con
// microsegundos, `2026-09-23T10:15:00.123456`) y lo que llega con zona. No usa
// `new Date(texto)`: en Hermes no lee todas esas formas igual que en el
// navegador.
export function dateOrNull(value: unknown): Date | null {
  if (value == null) return null;
  const match = DART_DATE.exec(String(value).trim());
  if (!match) return null;
  const [, y, mo, d, h = "0", mi = "0", s = "0", fraction = "", zone, sign, zh = "0", zm = "0"] = match;
  const ms = Number((fraction + "000").slice(0, 3));
  const date = new Date(0);
  if (zone) {
    date.setUTCFullYear(Number(y), Number(mo) - 1, Number(d));
    date.setUTCHours(Number(h), Number(mi), Number(s), ms);
    const offset = (Number(zh) * 60 + Number(zm)) * 60_000;
    if (sign) date.setTime(date.getTime() - (sign === "-" ? -offset : offset));
  } else {
    date.setFullYear(Number(y), Number(mo) - 1, Number(d));
    date.setHours(Number(h), Number(mi), Number(s), ms);
  }
  return Number.isNaN(date.getTime()) ? null : date;
}

// Una fecha como la escribe Flutter con `DateTime.toIso8601String()`: hora
// local y sin zona, `2026-10-30T00:00:00.000`. `toISOString()` daria la hora en
// UTC con una `Z`, y la app Flutter, que comparte las tablas, la leeria como
// otra hora.
export function toFlutterIso(date: Date): string {
  const two = (n: number) => String(n).padStart(2, "0");
  return (
    `${String(date.getFullYear()).padStart(4, "0")}-${two(date.getMonth() + 1)}-${two(date.getDate())}` +
    `T${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}` +
    `.${String(date.getMilliseconds()).padStart(3, "0")}`
  );
}

// `x?.toString().isEmpty == true ? null : x?.toString()`: vacio es `null`, pero
// sin recortar espacios, como `audience_program` y `comment` de las encuestas.
export function emptyToNull(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text === "" ? null : text;
}
