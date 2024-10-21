import { expect, stub } from 'lovecraft';
import hierophant from './hierophant.js';

describe('Hierophant', () => {
  const log = Symbol('log');
  const converse = Symbol('converse');

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should allow registering and resolving a simple provider', () => {
    const container = hierophant();
    container.provide(log, () => (...args) => console.log(...args));
    const logFn = container.resolve(log);

    logFn(['Hello', 'World']);

    expect(console.log.callCount).to.eq(1);
    expect(console.log.lastCall.args).to.deep.eq([['Hello', 'World']]);
  });

  it('should allow registering and resolving a provider with dependencies', () => {
    const container = hierophant();
    container.provide(log, () => (...args) => console.log(...args));
    container.provide(converse, container.depend([log], (logger) => (messages) => {
      logger(messages);
      return `I don't know what you said, but there were ${messages.length} messages.`;
    }));

    const converseFn = container.resolve(converse);
    const result = converseFn(['Hello', 'World']);

    expect(console.log.callCount).to.eq(1);
    expect(console.log.lastCall.args).to.deep.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages.");
  });

  it('should allow registering and resolving a decorated provider', () => {
    const container = hierophant();
    container.provide(log, () => (...args) => console.log(...args));
    container.provide(converse, container.depend([log], (logger) => (messages) => {
      logger(messages);
      return `I don't know what you said, but there were ${messages.length} messages.`;
    }));

    const logging = (log) => (fn) => (...args) => {
      log(`Calling ${fn.name}`, ...args);
      return fn(...args);
    };
    container.decorate(converse, container.depend([log], logging));

    const converseFn = container.resolve(converse);
    const result = converseFn(['Hello', 'World']);

    expect(console.log.callCount).to.eq(2);
    expect(console.log.firstCall.args).to.deep.eq(['Calling anonymous', ['Hello', 'World']]);
    expect(console.log.secondCall.args).to.deep.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages.");
  });

  it('should allow registering and resolving an aggregated provider', () => {
    const container = hierophant();
    container.provide(log, () => (...args) => console.log(...args));
    container.provide(converse, container.depend([log], (logger) => (messages) => {
      logger(messages);
      return `I don't know what you said, but there were ${messages.length} messages.`;
    }));

    const aggregator = (providers) => (messages) => {
      return providers.reduce((result, provider) => {
        return `${result} | ${provider(messages)}`;
      }, '');
    };
    container.aggregate(converse, container.depend([converse], aggregator));

    const converseFn = container.resolve(converse);
    const result = converseFn(['Hello', 'World']);

    expect(console.log.callCount).to.eq(1);
    expect(console.log.lastCall.args).to.deep.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages. | I don't know what you said, but there were 2 messages.");
  });

  it('should allow installing providers, decorators, and aggregators', () => {
    const container = hierophant();

    container.install({
      providers: [
        { symbol: log, dependencies: [], factory: () => (...args) => console.log(...args) },
        { symbol: converse, dependencies: [log], factory: (logger) => (messages) => {
          logger(messages);
          return `I don't know what you said, but there were ${messages.length} messages.`;
        }}
      ],
      decorators: [
        { symbol: converse, dependencies: [log], factory: (log) => (fn) => (...args) => {
          log(`Calling ${fn.name}`, ...args);
          return fn(...args);
        }}
      ],
      aggregators: [
        { symbol: converse, dependencies: [converse], factory: (providers) => (messages) => {
          return providers.reduce((result, provider) => {
            return `${result} | ${provider(messages)}`;
          }, '');
        }}
      ]
    });

    const converseFn = container.resolve(converse);
    const result = converseFn(['Hello', 'World']);

    expect(console.log.callCount).to.eq(2);
    expect(console.log.firstCall.args).to.deep.eq(['Calling anonymous', ['Hello', 'World']]);
    expect(console.log.secondCall.args).to.deep.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages. | I don't know what you said, but there were 2 messages.");
  });
});