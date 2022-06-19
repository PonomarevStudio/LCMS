import {html, LitElement} from "lit"
import {syncImport} from 'svalit/loader.mjs'
import {SafeUntil} from "svalit/directives.mjs"
import {fetchTemplate} from "#lib/template.mjs"
import {attachStateProxy} from "#lib/router.mjs"
import {unsafeHTML} from 'lit/directives/unsafe-html.js'
import {all, chain, catcher, syncTemplate} from "svalit/utils.mjs"
import './context-node.js'
import './app-context.mjs'
import './app-field.mjs'
import './app-html.mjs'
import {db} from "#db"

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

    fetchPage() {
        return this.fetchRouteData().status === 404 ? page404 :
            catcher(chain(this.fetchPageData(), data => data || page404), page404)
    }

    fetchContent({content}) {
        return content || fetchTemplate('../includes/templates/base.html', 'base', import.meta.url)
    }

    handleImports({imports}) {
        const importList = ['./import-test.mjs']
        if (imports) new Set(Object.values(imports)).forEach(url => importList.push(url))
        return all(importList.map(url => syncImport(url, import.meta.url)))
    }

    renderPageContent(content) {
        const importTest = syncImport('./import-test.mjs', import.meta.url).text
        return html`
            <main>
                ${content ? unsafeHTML(`<app-context>${content}</app-context>`) :
                        html`<p>Loading page <span>${this.url}</span> ...</p>`}
            </main>
            <import-test .text="${importTest}"></import-test>`
    }

    render() {
        const page = this.fetchPage()
        const content = chain(page, this.fetchContent.bind(this))
        const imports = chain(page, this.handleImports.bind(this))
        chain(page, this.setMeta.bind(this))
        return html`
            <context-node .data="${page}">
                ${this.safeUntil(...syncTemplate(this.renderPageContent.bind(this), content, imports))}
            </context-node>`
    }

    firstUpdated() {
        attachStateProxy()
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
        window.addEventListener('navigate', e => e.detail.href ? this.navigate(e.detail.href) : null);
        window.addEventListener('popstate', e => this.navigate(e.target.location.href, true));
    }
}

customElements.define('app-page', AppPage)
