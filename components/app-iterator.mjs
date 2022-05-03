import {html, LitElement} from "lit"
import {repeat} from 'lit/directives/repeat.js';
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {ContextController} from "../lib/context.mjs";

class AppIterator extends LitElement {
    context = new ContextController(this);

    static get properties() {
        return {key: {type: String}, template: {type: String}, items: {type: Array}}
    }

    getPartKey(index, items) {
        return `item ${index === 0 ? 'first' : (index === items.length - 1 ? 'last' : '')}`
    }

    render() {
        const items = this.items || this.context.fetchContext(this.key)
        const template = this.template || this.context.fetchContext('template')
        return repeat(items || [], (item, index) => html`
            <context-node .data="${item}" part="${this.getPartKey(index, items)}">
                ${unsafeHTML(template)}
            </context-node>`)
    }
}

customElements.define('app-iterator', AppIterator)
