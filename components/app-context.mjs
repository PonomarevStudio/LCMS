import {html, LitElement} from "lit"
import {ContextController} from "../lib/context.mjs";

class AppContext extends LitElement {
    context = new ContextController(this);

    static get properties() {
        return {
            title: {context: true}
        }
    }

    render() {
        this.title = 'Title from nested Context ✨'
        return html`
            <slot></slot>`
    }
}

customElements.define('app-context', AppContext)
