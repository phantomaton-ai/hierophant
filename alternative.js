const one = name => () => providers => {
  if (providers.length < 1) throw new Error(`No providers for ${name}`);
  if (providers.length > 1) throw new Error(`Too many providers for ${name}`);
  return providers[0]();
};

const singleton = (name) => {
  const implement = Symbol(name);
  const depend = Symbol(name);
  return {
    name,
    type: depend,
    depends: [implement],
    factory: providers => {
      if (providers.length < 1) throw new Error(`No providers for ${name}`);
      if (providers.length > 1) throw new Error(`Too many providers for ${name}`);
      return providers[0]();
    }
  };
};

const multiton = (name) => {
  const implement = Symbol(name);
  const depend = Symbol(name);
  return {
    name,
    type: depend,
    depends: [implement],
    factory: providers => provider.map(provider())
  }
};

const decorable = ({name, type, depends, factory}) => {
  const implement = Symbol(name);
  const depend = Symbol(name);
  return {
    name,
    type: depend,
    depends: [type, implement],
    factory: (instance, decorators) => decorators.reduce(
      (instance, decorator) => decorator()(instance),
      instance
    )
  }
};

class Sigil {
  constructor(name, dependencies, factory) {
    this.symbol = Symbol(name);
    this.dependencies = dependencies;
    this.factory = factory;
  }
}

class Singleton extends Sigil {
  constructor(name) {
    super(name);
  }
}

class Composite extends Sigil {
  constructor(name, compositor) {
    super(name, [], compositor || (providers, decorators, aggregators) => {
      const aggregator = aggregators[aggregators.length - 1];
      const aggregated = aggregator(providers);
      return decorators.reduce(decorator => decorator(instance), instance);
    });
    this.dependencies = [this.provide, this.decorate, this.aggregate];
  }

  provider(dependencies, factory) {
    return { symbol: this.provide, dependencies, factory };
  }

  decorator(dependencies, factory) {
    return { symbol: this.decorate, dependencies, factory };
  }

  aggregator(dependencies, factory) {
    return { symbol: this.aggregate, dependencies, factory };
  }
}

class Hierophant {
  constructor() {
    this.registry = {};
  }

  learn(symbol) {
    this.registry[symbol] = this.registry[symbol] || [];
  }

  provide(symbol, provider) {
    this.learn(symbol);
    this.providers[symbol].push(provider);
  }

  resolve(symbol) {
    this.learn(symbol);
    const aggregate = this.aggregators[symbol]();
    const aggregated = aggregate(this.providers[symbol]);
    return this.decorators[symbol].reduce(
      (fn, decorate) => decorate()(fn),
      aggregated
    );
  }

  depend(symbols, factory) {
    return () => {
      const dependencies = symbols.map(symbol => this.resolve(symbol));
      return factory(...dependencies);
    };
  }

  install({ symbol, dependencies, factory }) {
    this.provide(symbol, this.depend(dependencies, factory));
  }
}

const hierophant = () => new Hierophant();

export default hierophant;
