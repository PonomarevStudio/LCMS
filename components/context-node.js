import {html, LitElement} from "lit"
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {ContextController} from "../lib/context.mjs";

class ContextNode extends LitElement {
    context = new ContextController(this, {anyProperty: true});

    render() {
        if (this.renderRoot && this.renderRoot.querySelector) {
            const jsonNode = this.renderRoot.querySelector('script[type="application/json"]')
            if (jsonNode) Object.assign(this, JSON.parse(jsonNode.innerText))
        }
        const data = this.data
        delete this.data
        Object.assign(this, data)
        const json = JSON.stringify(data || {}, null, 4)
        return html`
            ${unsafeHTML(`<script type="application/json">${json}</script>`)}
            <slot></slot>`
    }
}

customElements.define('context-node', ContextNode)
