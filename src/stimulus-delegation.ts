import { Controller } from '@hotwired/stimulus';

export interface DelegationController extends Controller {
  delegatedEvents?: Map<string, EventListener>;
}

export type DelegationHandler = (this: DelegationController, event: Event, target: Element) => void;

export const useDelegation = {
  delegate(this: DelegationController, eventType: string, selector: string, handler: DelegationHandler) {
    if (!this.delegatedEvents) {
      this.delegatedEvents = new Map()
    }

    const key = `${eventType}:${selector}`
    
    // Remove existing listener if present
    if (this.delegatedEvents.has(key)) {
      const existingHandler = this.delegatedEvents.get(key)!
      this.element.removeEventListener(eventType, existingHandler)
    }

    // Create delegated event handler
    const delegatedHandler = (event: Event) => {
      const target = (event.target as Element)?.closest(selector)
      if (target && this.element.contains(target)) {
        // Bind handler to controller context and pass target + event
        handler.call(this, event, target)
      }
    }

    // Store and attach listener
    this.delegatedEvents.set(key, delegatedHandler)
    this.element.addEventListener(eventType, delegatedHandler)

    return this
  },

  undelegate(this: DelegationController, eventType: string, selector: string) {
    if (!this.delegatedEvents) return this

    const key = `${eventType}:${selector}`
    const handler = this.delegatedEvents.get(key)
    
    if (handler) {
      this.element.removeEventListener(eventType, handler)
      this.delegatedEvents.delete(key)
    }

    return this
  },

  // Clean up all delegated events (call in disconnect)
  undelegateAll(this: DelegationController) {
    if (!this.delegatedEvents) return this

    for (const [key, handler] of this.delegatedEvents) {
      const [eventType] = key.split(':')
      this.element.removeEventListener(eventType, handler)
    }
    
    this.delegatedEvents.clear()
    return this
  }
}
