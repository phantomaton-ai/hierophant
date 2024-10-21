const one = symbol => providers => {
  if (providers.length < 1) throw new Error(`No providers for ${symbol}`);
  if (providers.length > 1) throw new Error(`Too many providers for ${symbol}`);
  return providers[0];
};

class Hierophant {
  constructor() {
    providers = {};
    aggregators = {};
    decorators = {};
  }

  learn(symbol) {
    this.providers[symbol] = this.providers[symbol] || [];
    this.aggregators[symbol] = this.aggregators[symbol] || one(symbol);
    this.decorators[symbol] = this.decorators[symbol] || [];
  }

  provide(symbol, provider) {
    this.learn(symbol);
    this.providers[symbol].push(provider);
  }

  decorate(symbol, decorator) {
    this.learn(symbol);
    this.decorators[symbol].push(decorator);
  }

  aggregate(symbol, aggregator) {
    this.learn(symbol);
    this.aggregators[symbol] = aggregator;
  }

  resolve(symbol) {
    this.learn(symbol);
    const aggregate = this.aggregators[symbol];
    const aggregated = aggregate(this.providers[symbol]);
    return this.decorators[symbol].reduce(
      (fn, decorate) => decorate(fn),
      aggregated
    );
  }

  depend(symbols, factory) {
    return () => {
      const dependencies = symbols.map(symbol => this.resolve(symbol));
      return factory(...dependencies);
    }
  }

  install({ providers, aggregators, decorators }) {
    providers.forEach(({ symbol, dependencies, factory }) => {
      this.provide(symbol, this.depend(dependencies, factory));
    });
    aggregators.forEach(({ symbol, dependencies, factory }) => {
      this.aggregate(symbol, this.depend(dependencies, factory));
    });
    decorators.forEach(({ symbol, dependencies, factory }) => {
      this.decorate(symbol, this.depend(dependencies, factory));
    });
  }
}

const hierophant = () => new Hierophant();

export default hierophant;
