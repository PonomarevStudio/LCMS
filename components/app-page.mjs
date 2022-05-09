import {html, LitElement} from "lit"
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {SafeUntil} from "../lib/directives.mjs";
import {all, chain} from "#utils";
import './context-node.js'
import './app-context.mjs'
import './app-field.mjs'
import './app-html.mjs'
import {db} from "#db";
import {fetchTemplate} from "../lib/template.mjs";

class AppPage extends LitElement {
    safeUntil = new SafeUntil(this)

    static get properties() {
        return {
            url: {type: String}
        }
    }

    setMeta({title = 'LCMS', status} = {}) {
        if (typeof process === 'object') return;
        history.replaceState(history.state, title)
        document.title = title
    }

    fetchPageData() {
        const location = new URL(this.url)
        const path = location.pathname.split('/').filter(Boolean).shift() || 'index'
        if (window.page && window.page.url === this.url) return window.page
        return chain(db.collection('pages').findOne({path}), data => data || {
            title: '404 — Страница не найдена',
            description: `Вы можете вернуться на <a href="/">главную</a>`,
            status: 404
        })
    }

    render() {
        const page = this.fetchPageData()
        const content = fetchTemplate('../includes/templates/base.html', 'base', import.meta.url)
        chain(page, data => this.setMeta(data || {}))
        return html`
            <context-node .data="${page}">
                <app-context>
                    ${this.safeUntil(chain(all([page, content]), ([, content]) => unsafeHTML(content)))}
                </app-context>
            </context-node>`
    }
}

customElements.define('app-page', AppPage)
