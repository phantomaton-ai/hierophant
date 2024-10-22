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

  it('should allow registering and resolving an aggregated provider', () => {
    const container = hierophant();
    container.provide(converse, () => (messages) =>
      `I don't know what you said, but there were ${messages.length} messages.`
    );
    container.provide(converse, () => (messages) =>
      `The last message was ${messages[messages.length - 1]}.`
    );

    const aggregator = (providers) => (messages) =>
      providers.map(provider => provider()(messages)).join(' | ');
    container.aggregate(converse, () => aggregator);

    const converseFn = container.resolve(converse);
    const result = converseFn(['Hello', 'World']);

    expect(result).to.equal("I don't know what you said, but there were 2 messages. | The last message was World.");
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
          log(`Calling wrapped fn`, ...args);
          return fn(...args);
        }}
      ],
      aggregators: [
        { symbol: converse, dependencies: [converse], factory: (providers) => () => {
          return (messages) => providers.map(provider => provider()(messages)).join(' | ');
        }}
      ]
    });

    const converseFn = container.resolve(converse);
    const result = converseFn(['Hello', 'World']);

    expect(console.log.callCount).to.eq(2);
    expect(console.log.firstCall.args).to.deep.eq(["Calling wrapped fn", ['Hello', 'World']]);
    expect(console.log.secondCall.args).to.deep.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages. | The last message was World.");
  });
});