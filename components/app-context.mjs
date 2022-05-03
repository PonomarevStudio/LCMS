import {css, html, LitElement} from "lit"
import {ContextController} from "../lib/context.mjs";
import './app-iterator.mjs'
import './app-link.mjs'

class AppContext extends LitElement {
    context = new ContextController(this);

    static get styles() {
        return css`
          app-iterator {
            display: flex;
            flex-direction: column;
          }

          app-iterator::part(item) {
            margin: .5em 0;
          }

          app-iterator::part(item first) {
            margin-top: initial;
          }

          app-iterator::part(item last) {
            margin-bottom: initial;
          }
        `
    }

    static get properties() {
        return {
            title: {context: true}, links: {context: true}, template: {context: true}
        }
    }

    render() {
        this.links = [{href: '/', title: 'Index page'}, {href: '/test', title: 'Test page'}, {
            href: '/error',
            title: 'Error page'
        }]
        this.template = '<app-link></app-link>'
        return html`
            <slot></slot>
            <h2>Pages</h2>
            <nav>
                <app-iterator key="links"></app-iterator>
            </nav>`
    }
}

customElements.define('app-context', AppContext)
