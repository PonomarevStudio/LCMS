import {html, LitElement} from "lit"
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {syncUntil} from "../lib/directives.mjs";
import {chain} from "#utils";
import './context-node.js'
import './app-context.mjs'
import './app-field.mjs'

class AppPage extends LitElement {
    setMeta({title = 'LCMS'} = {}) {
        if (typeof process === 'object') return;
        history.replaceState(history.state, title)
        document.title = title
    }

    fetchPageData() {
        const data = {
            title: 'LCMS Page',
            content: '<h1><app-field key="title"></app-field></h1>'
        }
        this.setMeta(data)
        return this.page = data
    }

    render() {
        this.fetchPageData()
        return html`
            <context-node .data="${{page: this.page}}">
                <app-context>
                    ${syncUntil(chain(this.page, ({content}) => unsafeHTML(content)))}
                </app-context>
            </context-node>`
    }
}

customElements.define('app-page', AppPage)
