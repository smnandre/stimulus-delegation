import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDelegation, DelegationController, DelegationHandler } from '../../stimulus-delegation'

class TestController implements DelegationController {
  element: HTMLElement
  delegatedEvents?: Map<string, EventListener>
  
  handleClick = vi.fn()
  handleMouseover = vi.fn()
  handleChange = vi.fn()

  constructor() {
    this.element = document.createElement('div')
    this.element.innerHTML = `
      <button class="btn" data-action="save">Save</button>
      <button class="btn secondary" data-action="cancel">Cancel</button>
      <form>
        <input type="text" name="username" />
        <input type="email" name="email" />
      </form>
      <div class="nested">
        <span class="clickable">Nested clickable</span>
      </div>
    `
  }

  connect(): void {}
  disconnect(): void {}
}

// Mix in the delegation methods
function createController() {
  const ctrl = new TestController()
  const mixedCtrl = Object.assign(ctrl, useDelegation)
  return mixedCtrl
}

describe('useDelegation', () => {
  let ctrl: ReturnType<typeof createController>

  beforeEach(() => {
    ctrl = createController()
    document.body.appendChild(ctrl.element)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.resetAllMocks()
  })

  describe('delegate', () => {
    it('delegates events to matching child elements', () => {
      const handler: DelegationHandler = vi.fn()
      ctrl.delegate('click', '.btn', handler)

      const saveBtn = ctrl.element.querySelector('[data-action="save"]') as HTMLElement
      saveBtn.click()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.any(MouseEvent),
        saveBtn
      )
    })

    it('delegates to multiple matching elements', () => {
      const handler: DelegationHandler = vi.fn()
      ctrl.delegate('click', '.btn', handler)

      const saveBtn = ctrl.element.querySelector('[data-action="save"]') as HTMLElement
      const cancelBtn = ctrl.element.querySelector('[data-action="cancel"]') as HTMLElement
      
      saveBtn.click()
      cancelBtn.click()

      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenNthCalledWith(1, expect.any(MouseEvent), saveBtn)
      expect(handler).toHaveBeenNthCalledWith(2, expect.any(MouseEvent), cancelBtn)
    })

    it('ignores events from non-matching elements', () => {
      const handler: DelegationHandler = vi.fn()
      ctrl.delegate('click', '.btn', handler)

      const input = ctrl.element.querySelector('input') as HTMLElement
      input.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      expect(handler).not.toHaveBeenCalled()
    })

    it('works with nested elements using closest()', () => {
      const handler: DelegationHandler = vi.fn()
      ctrl.delegate('click', '.nested', handler)

      const nestedSpan = ctrl.element.querySelector('.nested span') as HTMLElement
      nestedSpan.click()

      const nestedDiv = ctrl.element.querySelector('.nested') as HTMLElement
      expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent), nestedDiv)
    })

    it('binds handler to controller context', () => {
      let boundThis: any
      const handler: DelegationHandler = function(this: any) {
        boundThis = this
      }
      
      ctrl.delegate('click', '.btn', handler)
      
      const btn = ctrl.element.querySelector('.btn') as HTMLElement
      btn.click()

      expect(boundThis).toBe(ctrl)
    })

    it('supports different event types', () => {
      const clickHandler: DelegationHandler = vi.fn()
      const mouseoverHandler: DelegationHandler = vi.fn()
      
      ctrl.delegate('click', '.btn', clickHandler)
      ctrl.delegate('mouseover', '.btn', mouseoverHandler)

      const btn = ctrl.element.querySelector('.btn') as HTMLElement
      btn.click()
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

      expect(clickHandler).toHaveBeenCalledTimes(1)
      expect(mouseoverHandler).toHaveBeenCalledTimes(1)
    })

    it('replaces existing handler for same event/selector combination', () => {
      const firstHandler: DelegationHandler = vi.fn()
      const secondHandler: DelegationHandler = vi.fn()
      
      ctrl.delegate('click', '.btn', firstHandler)
      ctrl.delegate('click', '.btn', secondHandler) // Should replace first

      const btn = ctrl.element.querySelector('.btn') as HTMLElement
      btn.click()

      expect(firstHandler).not.toHaveBeenCalled()
      expect(secondHandler).toHaveBeenCalledTimes(1)
    })

    it('returns controller instance for chaining', () => {
      const result = ctrl.delegate('click', '.btn', vi.fn())
      expect(result).toBe(ctrl)
    })

    it('initializes delegatedEvents map if not present', () => {
      expect(ctrl.delegatedEvents).toBeUndefined()
      
      ctrl.delegate('click', '.btn', vi.fn())
      
      expect(ctrl.delegatedEvents).toBeInstanceOf(Map)
      expect(ctrl.delegatedEvents.size).toBe(1)
    })
  })

  describe('undelegate', () => {
    it('removes specific delegated event listener', () => {
      const handler: DelegationHandler = vi.fn()
      ctrl.delegate('click', '.btn', handler)
      
      const btn = ctrl.element.querySelector('.btn') as HTMLElement
      btn.click()
      expect(handler).toHaveBeenCalledTimes(1)

      ctrl.undelegate('click', '.btn')
      btn.click()
      expect(handler).toHaveBeenCalledTimes(1) // No additional calls
    })

    it('only removes matching event/selector combination', () => {
      const clickHandler: DelegationHandler = vi.fn()
      const mouseoverHandler: DelegationHandler = vi.fn()
      
      ctrl.delegate('click', '.btn', clickHandler)
      ctrl.delegate('mouseover', '.btn', mouseoverHandler)

      ctrl.undelegate('click', '.btn')

      const btn = ctrl.element.querySelector('.btn') as HTMLElement
      btn.click()
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

      expect(clickHandler).not.toHaveBeenCalled()
      expect(mouseoverHandler).toHaveBeenCalledTimes(1)
    })

    it('handles undelegating non-existent listeners gracefully', () => {
      expect(() => ctrl.undelegate('click', '.nonexistent')).not.toThrow()
    })

    it('handles missing delegatedEvents map gracefully', () => {
      expect(ctrl.delegatedEvents).toBeUndefined()
      expect(() => ctrl.undelegate('click', '.btn')).not.toThrow()
    })

    it('returns controller instance for chaining', () => {
      const result = ctrl.undelegate('click', '.btn')
      expect(result).toBe(ctrl)
    })
  })

  describe('undelegateAll', () => {
    it('removes all delegated event listeners', () => {
      const clickHandler: DelegationHandler = vi.fn()
      const mouseoverHandler: DelegationHandler = vi.fn()
      const changeHandler: DelegationHandler = vi.fn()
      
      ctrl.delegate('click', '.btn', clickHandler)
      ctrl.delegate('mouseover', '.btn', mouseoverHandler)
      ctrl.delegate('change', 'input', changeHandler)

      expect(ctrl.delegatedEvents?.size).toBe(3)

      ctrl.undelegateAll()

      const btn = ctrl.element.querySelector('.btn') as HTMLElement
      const input = ctrl.element.querySelector('input') as HTMLElement
      
      btn.click()
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))

      expect(clickHandler).not.toHaveBeenCalled()
      expect(mouseoverHandler).not.toHaveBeenCalled()
      expect(changeHandler).not.toHaveBeenCalled()
      expect(ctrl.delegatedEvents?.size).toBe(0)
    })

    it('handles missing delegatedEvents map gracefully', () => {
      expect(ctrl.delegatedEvents).toBeUndefined()
      expect(() => ctrl.undelegateAll()).not.toThrow()
    })

    it('returns controller instance for chaining', () => {
      const result = ctrl.undelegateAll()
      expect(result).toBe(ctrl)
    })
  })

  describe('event containment', () => {
    it('ignores events from elements outside controller scope', () => {
      const handler: DelegationHandler = vi.fn()
      ctrl.delegate('click', '.btn', handler)

      // Create external button with same class
      const externalBtn = document.createElement('button')
      externalBtn.className = 'btn'
      document.body.appendChild(externalBtn)

      externalBtn.click()
      expect(handler).not.toHaveBeenCalled()
    })

    it('handles events when target is null/undefined', () => {
      const handler: DelegationHandler = vi.fn()
      ctrl.delegate('click', '.btn', handler)

      // Create event with no target
      const event = new Event('click', { bubbles: true })
      Object.defineProperty(event, 'target', { value: null })
      
      expect(() => ctrl.element.dispatchEvent(event)).not.toThrow()
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('integration patterns', () => {
    it('works in typical Stimulus controller disconnect pattern', () => {
      const handler: DelegationHandler = vi.fn()
      
      // Simulate controller connect
      ctrl.delegate('click', '.btn', handler)
      
      const btn = ctrl.element.querySelector('.btn') as HTMLElement
      btn.click()
      expect(handler).toHaveBeenCalledTimes(1)

      // Simulate controller disconnect
      ctrl.undelegateAll()
      
      btn.click()
      expect(handler).toHaveBeenCalledTimes(1) // No additional calls
    })

    it('supports method chaining for multiple delegations', () => {
      const clickHandler: DelegationHandler = vi.fn()
      const mouseoverHandler: DelegationHandler = vi.fn()
      
      const result = ctrl
        .delegate('click', '.btn', clickHandler)
        .delegate('mouseover', '.btn', mouseoverHandler)

      expect(result).toBe(ctrl)
      expect(ctrl.delegatedEvents?.size).toBe(2)
    })
  })
})
