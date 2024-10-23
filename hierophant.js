class Hierophant {
  constructor() {
    this.providers = new Map();
  }

  provide(symbol, provider) {
    if (!this.providers.has(symbol)) {
      this.providers.set(symbol, []);
    }
    this.providers.get(symbol).push(provider);
  }

  resolve(symbol) {
    const providers = this.providers.get(symbol) || [];
    if (providers.length === 0) {
      throw new Error(`No providers for ${symbol.description}`);
    }
    return providers.map(p => p()).flat();
  }

  install(component) {
    this.provide(component.symbol, () => {
      const deps = component.dependencies.map(dep => this.resolve(dep));
      return component.factory(...deps);
    });
  }
}

const hierophant = () => new Hierophant();

export default hierophant;