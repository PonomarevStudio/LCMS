import {css, html, LitElement} from "lit"
import {ContextController} from "../lib/context.mjs";

class AppLink extends LitElement {
    context = new ContextController(this);

    static get styles() {
        return css`
          a {
            color: inherit;
          }
        `
    }

    static get properties() {
        return {href: {type: String}, title: {type: String}}
    }

    render() {
        const href = this.href || this.context.fetchContext('href') || '/'
        const title = this.title || this.context.fetchContext('title') || 'Link'
        return html`<a href="${href}">
            <slot>${title}</slot>
        </a>`
    }
}

customElements.define('app-link', AppLink)
