import {LitElement} from "lit"
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {ContextController} from "../lib/context.mjs";
import {syncUntil} from "../lib/directives.mjs";
import {chain} from "#utils";
import './app-context.mjs'
import './app-field.mjs'

class AppPage extends LitElement {
    context = new ContextController(this);

    static get properties() {
        return {
            page: {context: true}
        }
    }

    setMeta({title = 'LCMS'} = {}) {
        if (typeof process === 'object') return;
        history.replaceState(history.state, title)
        document.title = title
    }

    fetchPageData() {
        const data = {
            title: 'LCMS Page',
            content: '<h1><app-context><app-field key="title"></app-field></app-context></h1>'
        }
        this.setMeta(data)
        return this.page = data
    }

    render() {
        const page = this.fetchPageData()
        return syncUntil(chain(page, page => unsafeHTML(page.content)))
    }
}

customElements.define('app-page', AppPage)
