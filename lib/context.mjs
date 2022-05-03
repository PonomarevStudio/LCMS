export class ContextController {
    constructor(host) {
        (this.host = host).addController(this)
        this.contexts = Object.fromEntries(Object.entries(
            this.host.constructor.properties || {}).filter(([, {context}]) => context))
    }

    fetchContext(property) {
        if (typeof process === 'object') return this.getServerContext(property);
        let context
        this.host.dispatchEvent(new CustomEvent('context', {
            detail: {property, callback: result => (context = result)}, bubbles: true, composed: true
        }))
        return context
    }

    getServerContext(property, stack = globalThis.renderInfo.customElementInstanceStack) {
        return stack.reverse().reduce((context, {element} = {}) => {
            if (context) return context;
            if (element.context && element.context.resolveContext) return element.context.resolveContext(property)
        }, undefined)
    }

    resolveContext(property) {
        return this.contexts[property] ? this.host[property] : undefined
    }

    contextEventHandler(event) {
        if (event.detail && event.detail.property && event.detail.callback && this.resolveContext(event.detail.property)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.detail.callback(this.resolveContext(event.detail.property))
        }
    }

    hostConnected() {
        this.host.addEventListener('context', this.contextEventHandler.bind(this))
    }

    hostDisconnected() {
        this.host.removeEventListener('context', this.contextEventHandler.bind(this))
    }
}
