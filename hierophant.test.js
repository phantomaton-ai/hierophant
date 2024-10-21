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
});
