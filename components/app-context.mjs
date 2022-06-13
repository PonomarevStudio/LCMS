import {css, html, LitElement} from "lit"
import {SafeUntil} from "svalit/directives.mjs";
import {ContextController} from "svalit/controllers.mjs";
import {all, chain} from "svalit/utils.mjs";
import {db} from "#db";
import './app-iterator.mjs'
import './app-link.mjs'
import {fetchTemplate} from "#lib/template.mjs";

class AppContext extends LitElement {
    context = new ContextController(this)
    safeUntil = new SafeUntil(this)

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
        return chain(db.collection('pages').find(),
            pages => pages.map(({path, ...page}) => ({
                title: 'Link', ...page,
                href: '/' + (path === 'index' ? '' : path)
            })))
    }

    updated() {
        requestAnimationFrame(() => this.title = this.context.fetchContext('title', {listen: true}) + ' 💧')
    }

    render() {
        const templateLoader = chain(fetchTemplate('../includes/link.html', 'link', import.meta.url), template => this.template = template)
        const linksLoader = chain(this.fetchLinks(), links => this.links = links)
        return this.safeUntil(chain(all([templateLoader, linksLoader]), () => html`
            <slot></slot><h2>Pages</h2>
            <nav>
                <app-iterator key="links"></app-iterator>
            </nav>`))
    }
}

customElements.define('app-context', AppContext)
