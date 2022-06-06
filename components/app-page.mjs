import {html, LitElement} from "lit"
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {SafeUntil} from "../lib/directives.mjs";
import {syncImport, imports} from '../lib/loader.mjs';
import {all, chain} from "#utils";
import './context-node.js'
import './app-context.mjs'
import './app-field.mjs'
import './app-html.mjs'
import {db} from "#db";
import {fetchTemplate} from "../lib/template.mjs";
import {attachStateProxy} from "../lib/router.mjs";

const page404 = {
    status: 404,
    title: '404 — Страница не найдена',
    content: fetchTemplate('../includes/404.html', '404', import.meta.url)
}

class AppPage extends LitElement {
    safeUntil = new SafeUntil(this)

    static get properties() {
        return {
            url: {type: String, reflect: true},
            state: {context: true}
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

    fetchPageImports({imports = {}} = {}) {
        if (!imports) return;
        return all(Object.entries(imports).filter(([element]) => !customElements.get(element)).map(([, url]) =>
            import(new URL(url, new URL('../', import.meta.url)).href)))
    }

    firstUpdated() {
        attachStateProxy()
    }

    render() {
        const page = this.fetchRouteData().status === 404 ? page404 : chain(this.fetchPageData(), data => data || page404)
        const content = chain(page, ({content}) => content || fetchTemplate('../includes/templates/base.html', 'base', import.meta.url))
        const imports = all([syncImport('./import-test.mjs', import.meta.url)])
        chain(page, data => {
            this.setMeta(data || {})
            this.fetchPageImports(data || {})
        })
        return html`
            <context-node .data="${page}">
                ${this.safeUntil(chain(all([page, content, imports]), ([, content]) =>
                        html`
                            <main>${unsafeHTML(`<app-context>${content}</app-context>`)}</main>
                            <import-test
                                    .text="${syncImport('./import-test.mjs', import.meta.url).text}"></import-test>`))}
            </context-node>`
    }

    navigate(url, skipHistory) {
        if (!skipHistory) {
            if (location.href === url) return;
            history.pushState({referrer: location.href}, 'LCMS', url);
        }
        attachStateProxy()
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
