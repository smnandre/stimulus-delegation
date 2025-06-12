# Stimulus Delegation: `useDelegation` Mixin

A TypeScript-compatible mixin for Stimulus controllers that provides efficient event delegation capabilities. Handle
events on dynamically added elements and nested structures without manual event listener management.

> [!TIP]
> This mixin helps you wire up DOM event delegation in Stimulus controllers, both declaratively and imperatively,
> without the need for additional build steps or decorators.

If you can, please consider [sponsoring](https://github.com/sponsors/smnandre) this project to support its development
and maintenance.

## Features

- **Event Delegation**: Listen to events on child elements using CSS selectors
- **Dynamic Content Support**: Automatically handles dynamically added elements
- **Automatic Cleanup**: Proper memory management with lifecycle-aware cleanup
- **TypeScript Support**: Fully typed with proper interfaces and generics
- **Method Chaining**: Fluent API for setting up multiple delegations
- **Performance Optimized**: Uses event bubbling and `closest()` for efficient matching

## Installation

### Using npm

```bash
npm install @smnandre/stimulus-delegation
```

### Using JSDeliver

If you prefer to use a CDN, you can import it directly from JSDeliver:

```js
import {useDelegation} from 'https://cdn.jsdelivr.net/npm/@smnandre/stimulus-delegation@latest';
```

## Basic Usage

```typescript
import {Controller} from '@hotwired/stimulus';
import {useDelegation, DelegationController} from '@smnandre/stimulus-delegation';

export default class extends Controller implements DelegationController {
  delegatedEvents?: Map<string, EventListener>;

  initialize() {
    Object.assign(this, useDelegation);
  }

  connect() {
    // Set up event delegation
    this.delegate('click', '.btn[data-action]', this.handleButtonClick)
      .delegate('input', 'input[type="text"]', this.handleTextInput)
      .delegate('change', 'select', this.handleSelectChange);
  }

  disconnect() {
    // Clean up all delegated events
    this.undelegateAll();
  }

  handleButtonClick(event: Event, target: Element) {
    const action = (target as HTMLElement).dataset.action;
    console.log(`Button clicked: ${action}`);
  }

  handleTextInput(event: Event, target: Element) {
    const input = target as HTMLInputElement;
    console.log(`Input changed: ${input.name} = ${input.value}`);
  }

  handleSelectChange(event: Event, target: Element) {
    const select = target as HTMLSelectElement;
    console.log(`Selection: ${select.value}`);
  }
}
```

## API Reference

### Methods

#### `delegate(eventType, selector, handler)`

Sets up event delegation for the specified event type and CSS selector.

- **eventType**: `string` - The event type to listen for (e.g., 'click', 'input')
- **selector**: `string` - CSS selector to match target elements
- **handler**: `DelegationHandler` - Function to call when event occurs
- **Returns**: `this` - For method chaining

```typescript
this.delegate('click', '.delete-btn', this.handleDelete);
```

#### `undelegate(eventType, selector)`

Removes a specific delegated event listener.

- **eventType**: `string` - The event type
- **selector**: `string` - CSS selector that was used
- **Returns**: `this` - For method chaining

```typescript
this.undelegate('click', '.delete-btn');
```

#### `undelegateAll()`

Removes all delegated event listeners. Call this in your controller's `disconnect()` method.

- **Returns**: `this` - For method chaining

```typescript
disconnect()
{
  this.undelegateAll();
}
```

## Advanced Usage

### Complex Selectors

Use any valid CSS selector for precise targeting:

```typescript
// Attribute selectors
this.delegate('click', '[data-action="save"]', this.handleSave);

// Class combinations
this.delegate('click', '.btn.primary:not(.disabled)', this.handlePrimary);

// Descendant selectors
this.delegate('change', 'form .required-field', this.handleRequired);

// Multiple selectors (use separate calls)
this.delegate('click', '.edit-btn', this.handleEdit);
this.delegate('click', '.delete-btn', this.handleDelete);
```

### Nested Elements

The mixin uses `element.closest(selector)` to find matching ancestors:

```html
// HTML
<div class="card" data-id="123">
    <h3>Card Title</h3>
    <span class="clickable">Click anywhere in card</span>
    <div class="actions">
        <button>Edit</button>
    </div>
</div>
```

```typescript
// Controller
this.delegate('click', '.card', this.handleCardClick);

handleCardClick(event: Event, target: Element){
  // target will be the .card element even if you click the span or button
  const cardId = (target as HTMLElement).dataset.id;
  console.log(`Card ${cardId} clicked`);
}
```

### Dynamic Content

Delegation automatically works with dynamically added elements:

```javascript
connect() {
  this.delegate('click', '.dynamic-btn', this.handleDynamic);
}

addNewButton() {
  const button = document.createElement('button');
  button.className = 'dynamic-btn';
  button.textContent = 'New Button';
  this.element.appendChild(button);
  // Event delegation automatically works!
}
```

### Event Handler Context

Handlers are bound to the controller instance:

```typescript
handleClick(event: Event, target: Element)
{
  // `this` refers to the controller
  this.someMethod();
  console.log(this.element); // Controller's element

  // Access the event and matched target
  event.preventDefault();
  const buttonText = target.textContent;
}
```

## TypeScript Integration

### Interface Implementation

```typescript
import {useDelegation, DelegationController} from './mixins/use-delegation';

interface MyController extends DelegationController {
  handleClick(event: Event, target: Element): void;

  handleInput(event: Event, target: Element): void;
}

export default class extends Controller implements MyController {
  delegatedEvents?: Map<string, EventListener>;

  initialize() {
    Object.assign(this, useDelegation);
  }

  // ... rest of implementation
}
```

### Helper Type

```typescript
import {WithDelegation} from './mixins/use-delegation';

type MyControllerWithDelegation = WithDelegation<Controller> & {
  someCustomMethod(): void;
};
```

## Real-World Examples

### Todo List Controller

```typescript
export default class extends Controller {
  initialize() {
    Object.assign(this, useDelegation);
  }

  connect() {
    this.delegate('click', '.todo-toggle', this.toggleTodo)
      .delegate('click', '.todo-delete', this.deleteTodo)
      .delegate('dblclick', '.todo-label', this.editTodo)
      .delegate('keypress', '.todo-edit', this.saveEdit)
      .delegate('blur', '.todo-edit', this.cancelEdit);
  }

  disconnect() {
    this.undelegateAll();
  }

  toggleTodo(event: Event, target: Element) {
    const checkbox = target as HTMLInputElement;
    const todoItem = checkbox.closest('.todo-item');
    todoItem?.classList.toggle('completed', checkbox.checked);
  }

  deleteTodo(event: Event, target: Element) {
    const todoItem = target.closest('.todo-item');
    todoItem?.remove();
  }
}
```

### Data Table Controller

```typescript
export default class extends Controller {
  initialize() {
    Object.assign(this, useDelegation);
  }

  connect() {
    this.delegate('click', 'th[data-sortable]', this.handleSort)
      .delegate('click', '.pagination-btn', this.handlePagination)
      .delegate('change', '.row-checkbox', this.handleRowSelect)
      .delegate('click', '.action-btn', this.handleRowAction);
  }

  handleSort(event: Event, target: Element) {
    const column = (target as HTMLElement).dataset.column;
    // Sort logic here
  }

  handleRowAction(event: Event, target: Element) {
    const action = (target as HTMLElement).dataset.action;
    const row = target.closest('tr');
    const rowId = row?.dataset.id;

    switch (action) {
      case 'edit':
        this.editRow(rowId);
        break;
      case 'delete':
        this.deleteRow(rowId);
        break;
    }
  }
}
```

## Testing

### Unit Tests

```typescript
import {describe, it, expect, vi} from 'vitest';
import {useDelegation} from './use-delegation';

describe('useDelegation', () => {
  it('delegates events correctly', () => {
    const controller = createTestController();
    const handler = vi.fn();

    controller.delegate('click', '.btn', handler);

    const button = controller.element.querySelector('.btn');
    button.click();

    expect(handler).toHaveBeenCalledWith(
      expect.any(MouseEvent),
      button
    );
  });
});
```

### E2E Tests

```typescript
import {test, expect} from '@playwright/test';

test('delegation works with dynamic content', async ({page}) => {
  await page.goto('/delegation-test');

  // Add dynamic button
  await page.click('#add-button');

  // Click dynamic button
  await page.click('.dynamic-btn');

  await expect(page.locator('#log')).toContainText('Dynamic button clicked');
});
```

## Performance Considerations

- **Event Bubbling**: Uses native event bubbling for efficiency
- **Single Listener**: One listener per event type, regardless of selector count
- **Memory Management**: Automatic cleanup prevents memory leaks
- **Selector Optimization**: Use specific selectors for better performance

## Troubleshooting

### Events Not Firing

1. **Check selector specificity**: Ensure your CSS selector matches the intended elements
2. **Verify event bubbling**: Some events don't bubble (e.g., `focus`, `blur`)
3. **Element containment**: Events only fire for elements within the controller's scope

### Memory Leaks

Always call `undelegateAll()` in your `disconnect()` method:

```typescript
disconnect()
{
  this.undelegateAll(); // Essential for cleanup
}
```

### TypeScript Errors

Ensure proper interface implementation:

```typescript
// ✅ Correct
class MyController extends Controller implements DelegationController {
  delegatedEvents?: Map<string, EventListener>;
}

// ❌ Missing interface implementation
class MyController extends Controller {
  // TypeScript errors will occur
}
```

## License

MIT License - feel free to use in your projects.
