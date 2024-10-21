// Method injection? That was sigilium...
class Participant {
  converse(messages) {
    throw new Error();
  }
}

class User extends Participant {}
class Assistant extends Participant {}

const converse = Sigil(Participant, 'converse');
converse.as(User).like((messages) => "Oh really?");
converse.as(Assistant).like((messages) => "beep boop!");

// Constructor injection?
container = hierophant();

const log = Symbol();
const converse = Symbol();

const fn = (log) => (messages) => {
  log(messages);
  return `I don't know what you said, but there were ${messages.length} messages.`;
}

container.provide(converse, container.depend([log], fn));

// ...or
const logging = log => fn => (...args) => {
  log(fn.name, ...args);
  return fn(...args);
};
container.decorate(converse, container.depend([log], logging));

// Also
container.aggregate(converse, ...);

// Oh and of course
container.resolve(converse);

// Or, all at once
container.install({
  providers: [ { symbol, dependencies, provider } ],
  decorators: [ { symbol, dependencies, factory } ],
  aggregators: [ { symbol, dependencies, factory } ]
});
