import "urlpattern-polyfill"
import {html, LitElement} from "lit"
import {chain} from "svalit/utils.mjs"
import {Router} from '@lit-labs/router'
import {SafeUntil} from "svalit/directives.mjs"

class LitRouter extends LitElement {
    safeUntil = new SafeUntil(this)
    router = new Router(this, [
        {path: '/', render: () => html`<h1>Home</h1>`},
        {path: '/test', render: () => html`<h1>Test</h1>`},
        {path: '/about', render: () => html`<h1>About</h3>`},
    ], {fallback: {render: () => html`<h1>404</h1>`}})

    static get properties() {
        return {url: {type: String}}
    }

    render() {
        const init = typeof process === 'object' ? this.router.goto(new URL(this.url).pathname) : true
        return html`
            <main>${this.safeUntil(chain(init, () => this.router.outlet()))}</main>
            <nav><a href="/">/</a><br><a href="/test">/test</a></nav>`
    }
}

customElements.define('lit-router', LitRouter)
