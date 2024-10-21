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
}

const hierophant = () => new Hierophant();

export default hierophant;
