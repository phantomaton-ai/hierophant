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

Hierophant builds upon the core concepts introduced in the `sigil` dependency injection framework:

1. **Containers**: Top-level entities that hold registered components and their dependencies.
2. **Components**: Individual modules, classes, or functions that can be injected as dependencies.
3. **Injectors**: Functions that resolve and inject dependencies into components.
4. **Sigils**: Identifiers used to register and reference components within a container.

## Usage 🪄

To use Hierophant, first import the `hierophant` function:

```javascript
import hierophant from 'hierophant';
```

Then, create a new container instance with any desired options:

```javascript
const container = hierophant({
  name: 'chat'
});
```

### Defining Extension Points 🌟

Hierophant allows you to define new extension points, which can be thought of as interfaces or abstractions that can be implemented by various components:

```javascript
const Greeter = container.define('greeter');

Greeter.register('basic', (name) => `Hello, ${name}!`);
Greeter.register('formal', (name) => `Greetings, ${name}.`);
```

### Implementing Extension Points 🔧

Components can then implement the defined extension points:

```javascript
class User {
  greet(name) {
    return Greeter.using(this).upon(name);
  }
}

class Admin extends User {
  greet(name) {
    return Greeter.as(Admin).using(this).upon(name);
  }
}
```

### Resolving Extension Points 🔍

The container can then be used to resolve the appropriate implementation of an extension point:

```javascript
const user = new User();
console.log(user.greet('Alice')); // Output: "Hello, Alice!"

const admin = new Admin();
console.log(admin.greet('Bob')); // Output: "Greetings, Bob."
```

## Contributing 🦄

We welcome contributions to the Hierophant project! If you have any ideas, bug reports, or pull requests, please feel free to submit them on the [Hierophant GitHub repository](https://github.com/phantomaton-ai/hierophant).

## License 🔒

Hierophant is licensed under the [MIT License](LICENSE).