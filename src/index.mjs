import {db} from "#db";
import {readFileSync} from "fs";
import EventEmitter from "events";
import {imports} from "#lib/loader.mjs";
import {Generator} from "@jspm/generator";
import {dumpTemplates} from "#lib/template.mjs";
import {readableFrom} from "@svalit/ssr/lib/readable.js";
import {render} from "@svalit/ssr/lib/render-with-global-dom-shim.js";

const readFile = path => readFileSync(new URL(path, import.meta.url))
const scriptTemplate = source => `<script>${source}</script>`

export default class RenderThread {
    chunks = []

    constructor(req, res, {
        renderEvents = new EventEmitter(),
        root = new URL('../', import.meta.url).href,
        env = [this.environment, 'browser', 'module'],
        headContent = readFile('../includes/head.html'),
        importMap = readFile('../includes/importmap.json'),
        footerContent = readFile('../includes/footer.html'),
        page = {title: 'LCMS', template: () => `Hello !`},
        environment = process.env.VERCEL_ENV === 'development' ? 'development' : 'production'
    } = {}) {
        Object.assign(this, {req, res, root, page, importMap, headContent, footerContent, environment, renderEvents})
        this.renderEvents.once('meta', this.metaHandler.bind(this))
        this.page.url = `${req.headers['x-forwarded-proto'].split(',').shift()}://${req.headers['x-forwarded-host']}${req.url}`
        globalThis.renderInfo = {customElementHostStack: [], customElementInstanceStack: []}
        this.importMapGenerator = new Generator({env, rootUrl: this.root, cache: false});
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
        return this.res.end(await this.importMapGenerator.htmlGenerate(output, {esModuleShims: true}))
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
        ].join('')
    }

    footerTemplate(page = this.page) {
        return [
            dumpTemplates(),
            scriptTemplate(`window.page=${JSON.stringify(page)}`),
            scriptTemplate(`window.cache=${db.exportCache()}`),
            scriptTemplate(`window.imports=${JSON.stringify(Object.keys(imports))}`),
            this.footerContent,
            `</body></html>`
        ].join('')
    }
}
