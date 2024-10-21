import { expect, stub } from 'lovecraft';
import hierophant from './hierophant';

describe('Hierophant', () => {
  describe('Providers', () => {
    it('should allow registering and resolving a simple provider', () => {
      const container = hierophant();
      const converse = Symbol('converse');

      container.provide(converse, (log) => (messages) => {
        log(messages);
        return `I don't know what you said, but there were ${messages.length} messages.`;
      });

      const logStub = stub(console, 'log');
      const converseFn = container.resolve(converse);
      const result = converseFn(['Hello', 'World']);
      expect(logStub).to.have.been.calledWith(['Hello', 'World']);
      expect(result).to.equal('I don't know what you said, but there were 2 messages.');
      logStub.restore();
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

      const logStub = stub(console, 'log');
      const converseFn = container.resolve(converse);
      const result = converseFn(['Hello', 'World']);
      expect(logStub).to.have.been.calledWith(['Hello', 'World']);
      expect(result).to.equal('I don't know what you said, but there were 2 messages.');
      logStub.restore();
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

      const logStub = stub(console, 'log');
      const converseFn = container.resolve(converse);
      const result = converseFn(['Hello', 'World']);
      expect(logStub).to.have.been.calledTwice;
      expect(logStub.firstCall).to.have.been.calledWith('Calling anonymous', ['Hello', 'World']);
      expect(logStub.secondCall).to.have.been.calledWith(['Hello', 'World']);
      expect(result).to.equal('I don't know what you said, but there were 2 messages.');
      logStub.restore();
    });
  });
});