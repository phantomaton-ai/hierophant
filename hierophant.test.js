import { expect, stub } from 'lovecraft';
import hierophant from './hierophant.js';

class Sigil {
  constructor(name) {
    this.impl = Symbol(`${name}:impl`);
    this.resolve = Symbol(`${name}:resolve`);
    this.name = name;
  }

  provider(dependencies, factory) {
    return {
      symbol: this.impl,
      dependencies,
      factory
    };
  }

  resolver() {
    return {
      symbol: this.resolve,
      dependencies: [this.impl],
      factory: (impls) => impls[0]
    };
  }
}

class Composite extends Sigil {
  constructor(name) {
    super(name);
    this.decorate = Symbol(`${name}:decorate`);
    this.aggregate = Symbol(`${name}:aggregate`);
  }

  decorator(dependencies, factory) {
    return {
      symbol: this.decorate,
      dependencies,
      factory
    };
  }

  aggregator(dependencies, factory) {
    return {
      symbol: this.aggregate,
      dependencies,
      factory
    };
  }

  resolver() {
    return {
      symbol: this.resolve,
      dependencies: [this.impl, this.decorate, this.aggregate],
      factory: (impls, decorators, aggregator) => {
        const base = aggregator ? aggregator(impls) : impls[0];
        return decorators.reduce((fn, decorate) => decorate(fn), base);
      }
    };
  }
}

describe('Hierophant', () => {
  let container;
  const log = new Sigil('log');
  const converse = new Composite('converse');

  beforeEach(() => {
    container = hierophant();
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should allow registering and resolving a simple provider', () => {
    container.install(log.resolver());
    container.install(log.provider([], () => (...args) => console.log(...args)));

    const [logger] = container.resolve(log.resolve);
    logger(['Hello', 'World']);

    expect(console.log.callCount).to.eq(1);
    expect(console.log.lastCall.args).to.deep.eq([['Hello', 'World']]);
  });

  it('should allow registering and resolving a provider with dependencies', () => {
    container.install(log.resolver());
    container.install(converse.resolver());

    container.install(log.provider([], () => (...args) => console.log(...args)));
    container.install(converse.provider([log.resolve], ([logger]) => (messages) => {
      logger(messages);
      return `I don't know what you said, but there were ${messages.length} messages.`;
    }));

    const [converseFn] = container.resolve(converse.resolve);
    const result = converseFn(['Hello', 'World']);

    expect(console.log.callCount).to.eq(1);
    expect(console.log.lastCall.args).to.deep.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages.");
  });

  it('should allow registering and resolving a decorated provider', () => {
    container.install(log.resolver());
    container.install(converse.resolver());

    container.install(log.provider([], () => (...args) => console.log(...args)));
    container.install(converse.provider([log.resolve], ([logger]) => (messages) => {
      logger(messages);
      return `I don't know what you said, but there were ${messages.length} messages.`;
    }));

    container.install(converse.decorator([log.resolve], ([logger]) => (fn) => (...args) => {
      logger("Calling wrapped fn", ...args);
      return fn(...args);
    }));

    const [converseFn] = container.resolve(converse.resolve);
    const result = converseFn(['Hello', 'World']);

    expect(console.log.callCount).to.eq(2);
    expect(console.log.firstCall.args).to.deep.eq(["Calling wrapped fn", ['Hello', 'World']]);
    expect(console.log.secondCall.args).to.deep.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages.");
  });

  it('should allow registering and resolving an aggregated provider', () => {
    container.install(converse.resolver());

    container.install(converse.provider([], () => (messages) =>
      `I don't know what you said, but there were ${messages.length} messages.`
    ));
    container.install(converse.provider([], () => (messages) =>
      `The last message was ${messages[messages.length - 1]}.`
    ));

    container.install(converse.aggregator([], () => (impls) => (messages) =>
      impls.map(impl => impl(messages)).join(' | ')
    ));

    const [converseFn] = container.resolve(converse.resolve);
    const result = converseFn(['Hello', 'World']);

    expect(result).to.equal("I don't know what you said, but there were 2 messages. | The last message was World.");
  });
});