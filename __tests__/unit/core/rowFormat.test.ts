import { boolOf, dateOrNull, emptyToNull, idOf, intOf, listOf, toFlutterIso } from "@/src/core/roble/rowFormat";

// Como lee y escribe Flutter cada tipo de columna. Los casos salen de correr
// `int.tryParse`, `jsonEncode` y `toIso8601String` en Dart.
describe("formato de filas", () => {
  it("el id sale de _id, o de id si no hay", () => {
    expect(idOf({ _id: "a", id: "b" })).toBe("a");
    expect(idOf({ id: 7 })).toBe("7");
    expect(idOf({})).toBeNull();
  });

  it("los enteros se leen como int.tryParse", () => {
    expect(intOf(4)).toBe(4);
    expect(intOf(" 4 ")).toBe(4);
    expect(intOf("+5")).toBe(5);
    expect(intOf("-3")).toBe(-3);
    expect(intOf("0x10")).toBe(16);
    expect(intOf("4.0")).toBe(0);
    expect(intOf("1e3")).toBe(0);
    expect(intOf(4.5)).toBe(0);
    expect(intOf("")).toBe(0);
    expect(intOf(null, 1)).toBe(1);
    expect(intOf(true)).toBe(0);
  });

  it("los booleanos aceptan texto y cada tabla elige que vale una columna nula", () => {
    expect(boolOf(true)).toBe(true);
    expect(boolOf("TRUE")).toBe(true);
    expect(boolOf("no_es_bool")).toBe(false);
    expect(boolOf(null)).toBe(false);
    expect(boolOf(undefined, true)).toBe(true);
  });

  it("las listas llegan como lista o como texto JSON", () => {
    expect(listOf(["a", 1])).toEqual(["a", "1"]);
    expect(listOf('["a", 1]')).toEqual(["a", "1"]);
    expect(listOf("  ")).toEqual([]);
    expect(listOf("cadena_no_json")).toEqual([]);
    expect(listOf('{"a":1}')).toEqual([]);
    expect(listOf(null)).toEqual([]);
  });

  it("JSON.stringify escribe las listas igual que jsonEncode", () => {
    // Salida de `jsonEncode` en Dart para la misma lista.
    expect(JSON.stringify(["Diseño UX", 'a"b', "c\\d", "línea\nnueva"])).toBe('["Diseño UX","a\\"b","c\\\\d","línea\\nnueva"]');
  });

  it("las fechas se escriben como toIso8601String: hora local, sin zona", () => {
    expect(toFlutterIso(new Date(2026, 9, 30))).toBe("2026-10-30T00:00:00.000");
    expect(toFlutterIso(new Date(2026, 11, 1, 8, 30, 5, 7))).toBe("2026-12-01T08:30:05.007");
  });

  it("las fechas se leen como DateTime.tryParse", () => {
    expect(dateOrNull("2026-09-23T10:15:00.000")).toEqual(new Date(2026, 8, 23, 10, 15));
    // Flutter escribe microsegundos cuando los hay.
    expect(dateOrNull("2026-12-01T08:30:05.007009")).toEqual(new Date(2026, 11, 1, 8, 30, 5, 7));
    expect(dateOrNull("2026-09-23 10:15")).toEqual(new Date(2026, 8, 23, 10, 15));
    expect(dateOrNull("2026-09-23")).toEqual(new Date(2026, 8, 23));
    expect(dateOrNull("2026-09-23T10:15:00.000Z")).toEqual(new Date(Date.UTC(2026, 8, 23, 10, 15)));
    expect(dateOrNull("2026-09-23T10:15:00-05:00")).toEqual(new Date(Date.UTC(2026, 8, 23, 15, 15)));
    expect(dateOrNull("no_es_fecha")).toBeNull();
    expect(dateOrNull(null)).toBeNull();
  });

  it("ida y vuelta de una fecha", () => {
    const d = new Date(2026, 4, 2, 9, 0, 0, 123);
    expect(dateOrNull(toFlutterIso(d))).toEqual(d);
  });

  it("vacio es nulo, sin recortar", () => {
    expect(emptyToNull("")).toBeNull();
    expect(emptyToNull(null)).toBeNull();
    expect(emptyToNull("  ")).toBe("  ");
  });
});
