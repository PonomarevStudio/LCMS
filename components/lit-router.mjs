import "urlpattern-polyfill"
import {html, LitElement} from "lit"
import {Router} from '@svalit/router'
import {SafeUntil} from "svalit/directives.mjs"

class LitRouter extends LitElement {
    safeUntil = new SafeUntil(this)
    router = new Router(this, [
        {path: '/', render: () => html`<h1>Home</h1>`},
        {path: '/test', render: () => html`<h1>Test</h1>`},
        {path: '/about', render: () => html`<h1>About</h3>`},
    ], {fallback: {render: () => html`<h1>404</h1>`}})

    static get properties() {
        return {url: {type: String, reflect: true}}
    }

    render() {
        if (typeof process === 'object') this.router.serverPath = new URL(this.url).pathname
        return html`
            <main>${this.safeUntil(this.router.outlet())}</main>
            <nav><a href="/">/</a><br><a href="/test">/test</a></nav>`
    }
}

customElements.define('lit-router', LitRouter)
