import {css, html, LitElement} from "lit"
import {syncUntil} from "../lib/directives.mjs";
import {ContextController} from "../lib/context.mjs";
import {chain} from "#utils";
import {db} from "#db";
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
            title: {context: true, proxy: true},
            links: {context: true, proxy: true},
            template: {context: true, proxy: true}
        }
    }

    fetchLinks() {
        return chain(db.collection('pages').find(), pages => pages.map(({path: href, ...page}) => ({...page, href})))
    }

    firstUpdated() {
        requestAnimationFrame(() => this.title = this.context.fetchContext('title') + ' 💧')
    }

    render() {
        this.template = '<app-link></app-link>'
        const linksLoader = chain(this.fetchLinks(), links => this.links = links)
        return syncUntil(chain(linksLoader, () => html`
            <slot></slot><h2>Pages</h2>
            <nav>
                <app-iterator key="links"></app-iterator>
            </nav>`))
    }
}

customElements.define('app-context', AppContext)
