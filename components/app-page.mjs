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

const page404 = {
    status: 404,
    title: '404 — Страница не найдена',
    content: fetchTemplate('../includes/404.html', '404', import.meta.url)
}

class AppPage extends LitElement {
    safeUntil = new SafeUntil(this)

    static get properties() {
        return {
            url: {type: String, reflect: true}
        }
    }

    setMeta({title = 'LCMS', status = 200} = {}) {
        if (typeof process === 'object') return;
        history.replaceState(history.state, title)
        document.title = title
    }

    fetchPageData() {
        const location = new URL(this.url)
        const path = location.pathname.split('/').filter(Boolean).shift() || 'index'
        return db.collection('pages').findOne({path})
    }

    fetchRouteData() {
        if (window.page && window.page.url === this.url) return window.page
        return {}
    }

    render() {
        const page = this.fetchRouteData().status === 404 ? page404 : chain(this.fetchPageData(), data => data || page404)
        const content = chain(page, ({content}) => content || fetchTemplate('../includes/templates/base.html', 'base', import.meta.url))
        chain(page, data => this.setMeta(data || {}))
        return html`
            <context-node .data="${page}">
                ${this.safeUntil(chain(all([page, content]), ([, content]) =>
                        unsafeHTML(`<app-context>${content}</app-context>`)))}
            </context-node>`
    }

    navigate(url, skipHistory) {
        if (!skipHistory) {
            if (location.href === url) return;
            history.pushState({referrer: location.href}, 'LCMS', url);
        }
        this.url = url
        document.title = 'LCMS'
        window.scrollTo(0, 0)
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('navigate', e => e.detail.href ? this.navigate(e.detail.href) : null);
        window.addEventListener('popstate', e => this.navigate(e.target.location.href, true));
    }
}

customElements.define('app-page', AppPage)
