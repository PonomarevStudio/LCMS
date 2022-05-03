import {LitElement} from "lit"
import {ContextController} from "../lib/context.mjs";

class AppField extends LitElement {
    context = new ContextController(this);

    static get properties() {
        return {key: {type: String}}
    }

    render() {
        const context = this.context.fetchContext('page') || {}
        return context[this.key] || ''
    }
}

customElements.define('app-field', AppField)
