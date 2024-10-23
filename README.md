# Hierophant 🕍

Hierophant is a minimalist dependency injection container for the Phantomaton AI. It provides a simple way to manage providers, decorators, and aggregators using symbols as identifiers.

## Purpose 🧠

Phantomaton needs a flexible way to manage dependencies between its various components and services. Hierophant provides this through a lightweight container that can:

- Register and resolve providers
- Support decoration patterns
- Enable aggregation strategies
- Handle dependency injection

## Usage 🪄

First, import the container factory:

```javascript
import hierophant from 'hierophant';
```

Create extension points using symbols:

```javascript
const log = Symbol('log');
const converse = Symbol('converse');
```

Then create a container and register components:

```javascript
const container = hierophant();

// Register a simple provider
container.provide(log, () => console.log);

// Register a provider with dependencies
container.provide(converse, container.depend([log], (logger) => (messages) => {
  logger(messages);
  return `Got ${messages.length} messages`;
}));

// Use the functionality
const [logger] = container.resolve(log);
const [converseFn] = container.resolve(converse);

converseFn(['Hello!']); // Logs then returns response
```

### Batch Installation 🔮

For more complex setups, you can install multiple components at once:

```javascript
container.install({
  providers: [
    { 
      symbol: log, 
      dependencies: [], 
      factory: () => console.log 
    },
    {
      symbol: converse,
      dependencies: [log],
      factory: (logger) => (messages) => {
        logger(messages);
        return `Got ${messages.length} messages`;
      }
    }
  ]
});
```

## Contributing 🦄

We welcome contributions to the Hierophant project! If you have any ideas, bug reports, or pull requests, please feel free to submit them on the [Hierophant GitHub repository](https://github.com/phantomaton-ai/hierophant).

## License 🔒

Hierophant is licensed under the [MIT License](LICENSE).