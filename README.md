# Hierophant 🕍

Hierophant is a minimalist dependency injection container for the Phantomaton AI, using smart identifiers called Sigils to manage component composition.

## Purpose 🧠

Phantomaton needs a flexible way to manage dependencies between its various components and services. Hierophant provides this through two key abstractions:

1. A minimal container that handles basic dependency resolution
2. Smart identifiers (Sigils) that encode their own composition patterns

This separation allows Phantomaton to focus on building innovative experiences while maintaining clean architectural boundaries.

## Core Concepts 🔮

### Sigils

Sigils are smart identifiers that know how to compose their implementations. Each Sigil defines:

- An implementation point (`impl`) where providers register
- A resolution point (`resolve`) where dependents connect
- A resolution strategy that determines how implementations compose

Basic Sigils expect exactly one implementation, while Composite Sigils support decoration and aggregation patterns.

### Container

The container is deliberately minimal, providing just three operations:

- `provide`: Register a provider for a symbol
- `resolve`: Resolve all providers for a symbol
- `install`: Register a component with dependencies

## Usage 🪄

First, define your Sigils:

```javascript
// A basic logging facility
const log = new Sigil('log');

// A composite conversation facility
const converse = new Composite('converse');
```

Then create a container and install components:

```javascript
const container = hierophant();

// Install resolvers
container.install(log.resolver());
container.install(converse.resolver());

// Install a basic provider
container.install(log.provider([], () => console.log));

// Install a provider with dependencies
container.install(converse.provider([log.resolve], ([logger]) => (messages) => {
  logger(messages);
  return `Got ${messages.length} messages`;
}));

// Add a decorator
container.install(converse.decorator([log.resolve], ([logger]) => (fn) => (...args) => {
  logger('Calling conversation');
  return fn(...args);
}));

// Add an aggregator
container.install(converse.aggregator([], () => (impls) => (messages) =>
  impls.map(impl => impl(messages)).join(' | ')
));

// Use the composed functionality
const [converseFn] = container.resolve(converse.resolve);
converseFn(['Hello!']); // Logs then returns response
```

### Creating New Sigil Types 🌟

You can create new Sigil types by extending the base class:

```javascript
class Singleton extends Sigil {
  resolver() {
    return {
      symbol: this.resolve,
      dependencies: [this.impl],
      factory: (impls) => {
        if (impls.length !== 1) {
          throw new Error(`Expected exactly one implementation for ${this.name}`);
        }
        return impls[0];
      }
    };
  }
}
```

## Contributing 🦄

We welcome contributions to the Hierophant project! If you have any ideas, bug reports, or pull requests, please feel free to submit them on the [Hierophant GitHub repository](https://github.com/phantomaton-ai/hierophant).

## License 🔒

Hierophant is licensed under the [MIT License](LICENSE).