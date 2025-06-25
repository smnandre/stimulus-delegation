import { Controller } from '@hotwired/stimulus'

export type DelegationHandler = (this: Controller, event: Event, target: Element) => void

export interface DelegationController extends Controller {
  delegatedEvents: Map<string, EventListener>
  delegate: (eventType: string, selector: string, handler: DelegationHandler) => this
  undelegate: (eventType: string, selector: string) => this
  undelegateAll: () => this
}

export function useDelegation(controller: Controller) {
  const delegationController = controller as DelegationController

  delegationController.delegatedEvents = new Map()

  const originalDisconnect = delegationController.disconnect.bind(delegationController)

  delegationController.disconnect = () => {
    delegationController.undelegateAll()
    originalDisconnect.call(delegationController)
  }

  delegationController.delegate = function (
    this: DelegationController,
    eventType: string,
    selector: string,
    handler: DelegationHandler,
  ) {
    const key = `${eventType}:${selector}`

    // Remove existing listener if present
    if (this.delegatedEvents.has(key)) {
      const existingHandler = this.delegatedEvents.get(key)!
      this.element.removeEventListener(eventType, existingHandler)
    }

    // Create delegated event handler
    const delegatedHandler = (event: Event) => {
      const eventTarget = event.target as Node | null
      if (!eventTarget) return

      const element = eventTarget.nodeType === Node.ELEMENT_NODE ? (eventTarget as Element) : eventTarget.parentElement
      const target = element?.closest(selector)

      if (target && this.element.contains(target)) {
        // Bind handler to controller context and pass target + event
        handler.call(this, event, target)
      }
    }

    // Store and attach listener
    this.delegatedEvents.set(key, delegatedHandler)
    this.element.addEventListener(eventType, delegatedHandler)

    return this
  }

  delegationController.undelegate = function (this: DelegationController, eventType: string, selector: string) {
    const key = `${eventType}:${selector}`
    const handler = this.delegatedEvents.get(key)

    if (handler) {
      this.element.removeEventListener(eventType, handler)
      this.delegatedEvents.delete(key)
    }

    return this
  }

  delegationController.undelegateAll = function (this: DelegationController) {
    for (const [key, handler] of this.delegatedEvents) {
      const [eventType] = key.split(':')
      this.element.removeEventListener(eventType, handler)
    }

    this.delegatedEvents.clear()
    return this
  }
}
