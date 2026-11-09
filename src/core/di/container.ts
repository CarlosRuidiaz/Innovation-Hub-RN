// El contenedor de dependencias mas simple: una instancia por token.
export class Container {
  private singletons = new Map<symbol, unknown>();

  register<T>(token: symbol, instance: T) {
    this.singletons.set(token, instance);
    return this;
  }

  resolve<T>(token: symbol): T {
    if (!this.singletons.has(token)) {
      throw new Error(`No provider for ${String(token)}`);
    }
    return this.singletons.get(token) as T;
  }

  // Para la prueba de arranque: que todo lo que la app pide este registrado.
  has(token: symbol): boolean {
    return this.singletons.has(token);
  }
}
