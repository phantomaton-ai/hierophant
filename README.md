# Hierophant 🕍

Hierophant is the dependency injection container for the Phantomaton AI. It serves as the central hub for managing the various components and services used across Phantomaton's ecosystem.

## Purpose 🧠

Phantomaton, as an AI assistant, requires a robust and flexible way to manage the dependencies between its different components and services. Hierophant is designed to provide this functionality, allowing Phantomaton to:

- Easily swap out different implementations of core services (e.g., language models, image generators, etc.)
- Compose reusable abilities and experiences across various Phantomaton agents
- Support multiple interfaces and interaction modalities (e.g., chat, CLI, REST API)
- Extend the core functionality through a plugin system

By abstracting the dependency management into Hierophant, Phantomaton can focus on building innovative and engaging experiences, without getting bogged down in the complexity of wiring up its internal components.

## Core Concepts 🔮

Hierophant provides the following core functionality:

1. **Providers**: Specific implementations that can be swapped in and out.
2. **Aggregators**: Strategies for dealing with multiple providers (e.g., raising errors for singletons, fan-out/fan-in for combining results).
3. **Decorators**: Wrappers that modify the behavior of other components by intercepting calls and potentially modifying inputs and outputs.

These concepts are defined and registered using `Symbol`s as identifiers, providing a flexible and extensible architecture.

## Usage 🪄

To use Hierophant, first import the `hierophant` function:

```javascript
import hierophant from 'hierophant';
```

Then, create a new Hierophant instance:

```javascript
const container = hierophant();
```

### Defining Providers 🌟

You can register a provider using the `provide` method:

```javascript
const log = Symbol('log');
container.provide(log, () => console.log);
```

### Defining Decorators 🔧

You can register a decorator using the `decorate` method:

```javascript
const logging = (log) => (fn) => (...args) => {
  log(`Calling ${fn.name}`, ...args);
  return fn(...args);
};
container.decorate(log, container.depend([log], logging));
```

### Defining Aggregators 🔍

You can register an aggregator using the `aggregate` method:

```javascript
const converse = Symbol('converse');
const aggregator = (providers) => (messages) =>
  providers.map(provider => provider()(messages)).join(' | ');
container.aggregate(converse, () => aggregator);
```

### Resolving Dependencies 🔮

You can resolve a provider, decorator, or aggregator using the `resolve` method:

```javascript
const logFn = container.resolve(log);
logFn('Hello, Hierophant!');

const converseFn = container.resolve(converse);
const result = converseFn(['Hello', 'World']);
```

### Composing Functionality 🧠

You can use the `depend` method to create a function that resolves and injects dependencies:

```javascript
const chatbot = container.depend([log, converse], (logger, converseFn) => (messages) => {
  logger(messages);
  return converseFn(messages);
});
chatbot(['Hello', 'World']);
```

### Installing Providers, Decorators, and Aggregators 🔧

You can install a set of providers, decorators, and aggregators using the `install` method:

```javascript
container.install({
  providers: [
    { symbol: log, dependencies: [], factory: () => console.log },
    { symbol: converse, dependencies: [log], factory: (logger) => (messages) => {
      logger(messages);
      return `I don't know what you said, but there were ${messages.length} messages.`;
    }}
  ],
  decorators: [
    { symbol: converse, dependencies: [log], factory: (logger) => (fn) => (...args) => {
      logger(`Calling wrapped fn`, ...args);
      return fn(...args);
    }}
  ],
  aggregators: [
    { symbol: converse, dependencies: [converse], factory: (providers) => (messages) => {
      return providers.map(provider => provider()(messages)).join(' | ');
    }}
  ]
});
```

## Contributing 🦄

We welcome contributions to the Hierophant project! If you have any ideas, bug reports, or pull requests, please feel free to submit them on the [Hierophant GitHub repository](https://github.com/phantomaton-ai/hierophant).

## License 🔒

Hierophant is licensed under the [MIT License](LICENSE).