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
        this.page = {...this.context.fetchContext('page')}
        this.page.title = 'Page title from Context ✨'
        // if (!this.page.content) this.page.content = '<h1><app-field key="title"></app-field></h1>'
        return html`
            <slot></slot>`
    }
}

customElements.define('app-context', AppContext)
