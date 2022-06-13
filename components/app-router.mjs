import {Router} from "#lib/router.mjs"
import {html, LitElement} from "lit"

class AppRouter extends LitElement {
    router = new Router(this, {
        routes: [
            {path: '/', render: (path) => html`<h1>Index page 😉</h1><p>Path: ${path}</p>`},
            {path: 'test', render: (path) => html`<h1>Test page 🤪</h1><p>Path: ${path}</p>`}
        ],
        fallback: {render: (path) => html`<h1>404 🫥</h1><p>Path: ${path}</p>`}
    })

    static get properties() {
        return {
            url: {type: String, reflect: true}
        }
    }

    render() {
        return html`
            <main>${this.router.outlet()}</main>`
    }
}

customElements.define('app-router', AppRouter)
