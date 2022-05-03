import {html, LitElement} from "lit"
import {ContextController} from "../lib/context.mjs";

class AppContext extends LitElement {
    context = new ContextController(this);

    static get properties() {
        return {
            page: {context: true}
        }
    }

    render() {
        this.page = {title: 'Page title from Context ✨'}
        return html`
            <slot></slot>`
    }
}

customElements.define('app-context', AppContext)
