import {LitElement} from "lit"
import {ContextController} from "svalit/controllers.mjs";

export class AppField extends LitElement {
    context = new ContextController(this);

    static get properties() {
        return {key: {type: String}, value: {state: true}}
    }

    fetchValue() {
        return this.value || this.context.fetchContext(this.key, {listen: true})
    }

    render() {
        return this.fetchValue() || ''
    }
}

customElements.define('app-field', AppField)
