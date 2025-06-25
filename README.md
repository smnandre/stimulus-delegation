# Stimulus Delegation: `useDelegation`

A function for Stimulus controllers that provides efficient event delegation capabilities. Handle events on dynamically
added elements and nested structures without manual event listener management.

> [!TIP]
> This function helps you wire up DOM event delegation in Stimulus controllers, both declaratively and imperatively,
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
import {useDelegation} from '@smnandre/stimulus-delegation';

export default class extends Controller {
  initialize() {
    // Pass the controller instance directly to the function
    useDelegation(this);
  }

  connect() {
    // Still use the fluent API for setting up delegations
    this.delegate('click', '.btn[data-action]', this.handleButtonClick)
      .delegate('input', 'input[type="text"]', this.handleTextInput);
  }

  handleButtonClick(event, target) {
    console.log(`Button clicked: ${target.dataset.action}`);
  }

  handleTextInput(event, target) {
    console.log(`Input value: ${target.value}`);
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

Removes all delegated event listeners. This is handled automatically when the controller disconnects, so you don't need to call it manually unless you want to remove all delegations before disconnect.

- **Returns**: `this` - For method chaining

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

The delegation mechanism uses `element.closest(selector)` to find matching ancestors:

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

// Handler function
function handleCardClick(event, target) {
  // target will be the .card element even if you click the span or button
  const cardId = target.dataset.id;
  console.log(`Card ${cardId} clicked`);
}
```

### Dynamic Content

Delegation automatically works with dynamically added elements:

```javascript
// Connect method
function connect() {
  this.delegate('click', '.dynamic-btn', this.handleDynamic);
}

// Add new button method
function addNewButton() {
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
// Handler function
function handleClick(event, target) {
  // `this` refers to the controller
  this.someMethod();
  console.log(this.element); // Controller's element

  // Access the event and matched target
  event.preventDefault();
  const buttonText = target.textContent;
}
```

## TypeScript Integration

To ensure type safety in your TypeScript project, you can inform the compiler that your controller has been enhanced with delegation capabilities.

Declare the delegation methods on your controller class and TypeScript will recognize them.

```typescript
import { Controller } from '@hotwired/stimulus'
import { useDelegation, DelegationController } from '@smnandre/stimulus-delegation'

export default class extends Controller {
  // Inform TypeScript about the added methods
  delegate!: DelegationController['delegate']
  undelegate!: DelegationController['undelegate']
  undelegateAll!: DelegationController['undelegateAll']

  initialize() {
    useDelegation(this)
  }

  connect() {
    this.delegate('click', '.btn', this.handleClick)
  }

  handleClick(event: Event, target: Element) {
    // handler logic
  }
}
```

## Real-World Examples

### Todo List Controller

```typescript
export default class extends Controller {
  initialize() {
    useDelegation(this)
  }

  connect() {
    this.delegate('click', '.todo-toggle', this.toggleTodo)
      .delegate('click', '.todo-delete', this.deleteTodo)
      .delegate('dblclick', '.todo-label', this.editTodo)
      .delegate('keypress', '.todo-edit', this.saveEdit)
      .delegate('blur', '.todo-edit', this.cancelEdit);
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
    useDelegation(this)
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
import { describe, it, expect, vi } from 'vitest'
import { useDelegation } from '@smnandre/stimulus-delegation'
import { Controller } from '@hotwired/stimulus'

describe('useDelegation', () => {
  it('delegates events correctly', () => {
    // Create a test controller
    const controller = {
      element: document.createElement('div'),
      disconnect: () => {}
    } as unknown as Controller
    
    // Add a button to test with
    const button = document.createElement('button')
    button.className = 'btn'
    controller.element.appendChild(button)
    
    // Apply delegation
    useDelegation(controller)
    
    // Set up delegation and handler
    const handler = vi.fn()
    controller.delegate('click', '.btn', handler)
    
    // Trigger event
    button.click()
    
    // Verify handler was called with correct arguments
    expect(handler).toHaveBeenCalledWith(
      expect.any(MouseEvent),
      button
    )
  })
})
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

1.  **Check selector specificity**: Ensure your CSS selector matches the intended elements
2.  **Verify event bubbling**: Some events don't bubble (e.g., `focus`, `blur`)
3.  **Element containment**: Events only fire for elements within the controller's scope

## License

Released under the [MIT License](LICENSE) by [Simon André](https://github.com/smnandre).

---

**[GitHub Repository](https://github.com/smnandre/stimulus-delegation) · [Report Issues](https://github.com/smnandre/stimulus-delegation/issues)**
