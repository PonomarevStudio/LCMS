import {LitElement} from "lit"
import {ContextController} from "../lib/context.mjs";

class AppField extends LitElement {
    context = new ContextController(this);

    static get properties() {
        return {key: {type: String}}
    }

    render() {
        return this.context.fetchContext(this.key) || ''
    }
}

customElements.define('app-field', AppField)
