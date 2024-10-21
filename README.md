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

Then, create a new Hierophant instance and use its methods to manage providers, aggregators, and decorators:

```javascript
const container = hierophant();

// Define a 'converse' extension point
const converse = Symbol('converse');

// Register a provider for the 'converse' extension point
container.provide(converse, (log) => (messages) => {
  log(messages);
  return `I don't know what you said, but there were ${messages.length} messages.`;
});

// Register a decorator for the 'converse' extension point
const logging = (log) => (fn) => (...args) => {
  log(fn.name, ...args);
  return fn(...args);
};
container.decorate(converse, container.depend([log], logging));

// Resolve the 'converse' extension point
const converseFn = container.resolve(converse);
console.log(converseFn(['Hello', 'World']));
```

## Contributing 🦄

We welcome contributions to the Hierophant project! If you have any ideas, bug reports, or pull requests, please feel free to submit them on the [Hierophant GitHub repository](https://github.com/phantomaton-ai/hierophant).

## License 🔒

Hierophant is licensed under the [MIT License](LICENSE).