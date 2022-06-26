import {db} from "#db"
import "urlpattern-polyfill"
import {html, LitElement} from "lit"
import {Router} from '@svalit/router'
import {syncImport} from "svalit/loader.mjs"
import {SafeUntil} from "svalit/directives.mjs"
import {fetchTemplate} from "#lib/template.mjs"
import {attachStateProxy} from "#lib/router.mjs"
import {unsafeHTML} from "lit/directives/unsafe-html.js"
import {all, catcher, chain, syncTemplate} from "svalit/utils.mjs"
import './context-node.js'
import './app-context.mjs'

const page404 = {
    status: 404,
    title: '404 — Страница не найдена',
    content: fetchTemplate('../includes/404.html', '404', import.meta.url)
}

class LitRouter extends LitElement {
    safeUntil = new SafeUntil(this)
    router = new Router(this, [
        {
            path: '*',
            render: params => {
                this.url = new URL(params['0'], this.url).href
                this.page = this.fetchPage(this.url)
                this.content = chain(this.page, this.fetchContent.bind(this))
                this.imports = chain(this.page, this.handleImports.bind(this))
                chain(this.page, this.setMeta.bind(this))
                attachStateProxy()
                return html`
                    <context-node .data="${this.page}">
                        ${this.safeUntil(...syncTemplate(this.renderPageContent.bind(this), this.content, this.imports))}
                    </context-node>`
            }
        }
    ], {fallback: {render: () => html`<h1>404</h1>`}})

    static get properties() {
        return {url: {type: String, reflect: true}}
    }

    fetchRouteData(url = this.url) {
        if (window.meta && window.meta.url === url) return window.meta
        return {}
    }

    fetchPageData(url = this.url) {
        const location = new URL(url)
        const path = location.pathname.split('/').filter(Boolean).shift() || 'index'
        return db.collection('pages').findOne({path})
    }

    fetchPage(url = this.url) {
        return this.fetchRouteData(url).status === 404 ? page404 :
            catcher(chain(this.fetchPageData(url), data => data || page404), page404)
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
        if (typeof process === 'object') this.router.serverPath = new URL(this.url).pathname
        return html`
            <main>${this.safeUntil(this.router.outlet())}</main>
            <nav><a href="/">/</a><br><a href="/test">/test</a></nav>`
    }

    setMeta({title = 'LCMS', status = 200} = {}) {
        if (typeof process === 'object') return;
        history.replaceState(history.state, title)
        document.title = title
    }
}

customElements.define('lit-router', LitRouter)
