// El `Fake` de Dart, en TypeScript, como en r_market.
//
// En Flutter los falsos son `class X extends Fake implements IRepo`: se
// escriben solo los metodos que la prueba usa, y si el codigo llama a otro, la
// prueba falla diciendo cual. Aqui lo mismo con un Proxy: lo que no se paso
// lanza un error con su nombre en vez de devolver `undefined` en silencio.
export function fake<T extends object>(implemented: Partial<T>, name = "falso"): T {
  return new Proxy(implemented, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      // Las promesas preguntan por `then`: un falso no es una promesa.
      if (prop === "then" || typeof prop === "symbol") return undefined;
      return () => {
        throw new Error(`${name}.${String(prop)} no está implementado en el falso de esta prueba`);
      };
    },
  }) as T;
}
