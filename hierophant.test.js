import { expect, stub } from 'lovecraft';
import hierophant from './hierophant.js';

describe('Hierophant', () => {
  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should allow registering and resolving a simple provider', () => {
    const container = hierophant();
    const converse = Symbol('converse');

    container.provide(converse, (log) => (messages) => {
      log(messages);
      return `I don't know what you said, but there were ${messages.length} messages.`;
    });

    const converseFn = container.resolve(converse);
    const result = converseFn(['Hello', 'World']);
    expect(console.log.callCount).to.eq(1);
    expect(console.log.lastCall.args).to.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages.");
  });

  it('should allow registering and resolving a provider with dependencies', () => {
    const container = hierophant();
    const log = Symbol('log');
    const converse = Symbol('converse');

    container.provide(log, () => console.log);
    container.provide(converse, container.depend([log], (logger) => (messages) => {
      logger(messages);
      return `I don't know what you said, but there were ${messages.length} messages.`;
    }));

    const converseFn = container.resolve(converse);
    const result = converseFn(['Hello', 'World']);
    expect(console.log.callCount).to.eq(1);
    expect(console.log.lastCall.args).to.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages.");
  });

  it('should allow registering and resolving a decorated provider', () => {
    const container = hierophant();
    const log = Symbol('log');
    const converse = Symbol('converse');

    container.provide(log, () => console.log);
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
    expect(console.log.firstCall.args).to.eq(['Calling anonymous', ['Hello', 'World']]);
    expect(console.log.secondCall.args).to.eq([['Hello', 'World']]);
    expect(result).to.equal("I don't know what you said, but there were 2 messages.");
  });
});
