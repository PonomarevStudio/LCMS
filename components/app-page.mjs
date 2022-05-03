import {html, LitElement} from "lit"
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {syncUntil} from "../lib/directives.mjs";
import {chain} from "#utils";
import './context-node.js'
import './app-context.mjs'
import './app-field.mjs'
import {db} from "#db";

class AppPage extends LitElement {
    setMeta({title = 'LCMS'} = {}) {
        if (typeof process === 'object') return;
        history.replaceState(history.state, title)
        document.title = title
    }

    fetchPageData() {
        return db.collection('pages').findOne({path: 'index'})
    }

    render() {
        const page = this.fetchPageData()
        chain(page, this.setMeta)
        return html`
            <context-node .data="${page}">
                <app-context>
                    ${syncUntil(chain(page, ({content}) => unsafeHTML(content)))}
                </app-context>
            </context-node>`
    }
}

customElements.define('app-page', AppPage)
