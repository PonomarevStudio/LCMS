import {db} from "#db";
import {readFileSync} from "fs";
import EventEmitter from "events";
import {imports} from "#lib/loader.mjs";
import {Generator} from "@jspm/generator";
import {dumpTemplates} from "#lib/template.mjs";
import {readableFrom} from "@svalit/ssr/lib/readable.js";
import {render} from "@svalit/ssr/lib/render-with-global-dom-shim.js";

const readFile = path => readFileSync(new URL(path, import.meta.url))
const scriptTemplate = (source, attributes = {}) =>
    `<script ${Object.entries(attributes).map(([k, v]) => k + (v ? `="${v}"` : '')).join(' ')}>${source}</script>`

export default class RenderThread {
    chunks = []

    constructor(req, res, {
        env = false,
        isDev = false,
        renderEvents = new EventEmitter(),
        root = new URL('../', import.meta.url).href,
        headContent = readFile('../includes/head.html'),
        importMap = readFile('../includes/importmap.json'),
        footerContent = readFile('../includes/footer.html'),
        page = {title: 'LCMS', template: () => `Hello !`}
    } = {}) {
        globalThis.renderInfo = {customElementHostStack: [], customElementInstanceStack: []}
        globalThis.env = this.env = env || [isDev ? 'development' : 'production', 'browser', 'module']
        Object.assign(this, {req, res, root, page, isDev, importMap, headContent, footerContent, renderEvents})
        this.page.url = `${req.headers['x-forwarded-proto'].split(',').shift()}://${req.headers['x-forwarded-host']}${req.url}`
        this.importMapGenerator = new Generator({rootUrl: root, cache: isDev, env: this.env})
        this.renderEvents.once('meta', this.metaHandler.bind(this))
    }

    async renderTemplate(template = this.page.template) {
        this.page.setMeta = data => this.renderEvents.emit('meta', data || {})
        this.stream = readableFrom(render(template(this), globalThis.renderInfo), true)
        this.stream.on('end', this.streamHandler.bind(this))
        for await (let chunk of this.stream) this.chunks.push(Buffer.from(chunk))
    }

    async streamHandler() {
        if (this.page.status) this.res.status(this.page.status)
        this.res.setHeader('Content-Disposition', 'inline');
        this.res.setHeader('Access-Control-Allow-Origin', '*');
        this.res.setHeader('Content-Type', 'text/html; charset=utf-8');
        this.renderEvents.emit('meta', {})
        const output = Buffer.concat(this.chunks) + this.footerTemplate()
        const result = await this.importMapGenerator.htmlGenerate(output, {esModuleShims: true})
        return this.res.end(result.replaceAll('type="importmap"', 'type="importmap-shim"').replaceAll('type="module"', 'type="module-shim"'))
    }

    metaHandler({title = this.page.title, status = 200} = {}) {
        this.chunks.unshift(Buffer.from(this.headTemplate(title)))
        if (status) this.page.status = status;
        if (title) this.page.title = title;
    }

    headTemplate(title = 'LCMS') {
        return [
            `<!doctype html><html lang="ru"><head>`,
            this.headContent,
            `<script type="importmap">${this.importMap}</script>`,
            `<title>${title}</title>`,
            `</head><body>`
        ].join('\n')
    }

    footerTemplate(page = this.page) {
        const importScriptAttributes = {type: "module", defer: null}
        const importTemplate = (url) => `import '${url.startsWith('/') ? ('#root' + url) : url}';`
        return [
            dumpTemplates(),
            scriptTemplate(`window.imports=${JSON.stringify(Object.keys(imports))}`),
            scriptTemplate(`window.env=${JSON.stringify(globalThis.env)}`),
            scriptTemplate(`window.page=${JSON.stringify(page)}`),
            scriptTemplate(`window.cache=${db.exportCache()}`),
            this.footerContent,
            Object.keys(imports).map(url => scriptTemplate(importTemplate(url), importScriptAttributes)).join('\n'),
            `</body></html>`
        ].join('\n')
    }
}
