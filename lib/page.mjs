import {render} from "@lit-labs/ssr/lib/render-with-global-dom-shim.js"
import {readableFrom} from "@lit-labs/ssr/lib/readable.js"
import EventEmitter from "events"
import {readFileSync} from "fs"
import {html} from "lit"

import '../components/app-page.mjs'

const readFile = path => readFileSync(new URL(path, import.meta.url))

const head = readFile('../includes/head.html')
const footer = readFile('../includes/footer.html')
const importMap = `<script type="importmap">${readFile('../includes/importmap.json')}</script>`
const titleTemplate = (title = 'LCMS') => `<title>${title}</title>`

const template = ({req: {url}, setMeta}) => html`
    <app-page .setMeta="${setMeta}"><span style="color: coral">Not rendered</span></app-page>`

export async function createRenderThread(req, res) {
    const chunks = [];
    const renderEvents = new EventEmitter();

    const setMeta = data => renderEvents.emit('meta', data);

    renderEvents.once('meta', ({title}) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Disposition', 'inline');
        res.write(`<!doctype html><html lang="ru"><head>${head}${importMap}${titleTemplate(title)}</head><body>`)
    })

    globalThis.renderInfo = {
        customElementHostStack: [],
        customElementInstanceStack: []
    }

    const stream = readableFrom(render(template({req, setMeta}), globalThis.renderInfo), true)

    stream.on('end', () => {
        renderEvents.emit('meta', {})
        res.write(Buffer.concat(chunks))
        res.end(`${footer}</body></html>`)
    })

    for await (let chunk of stream) chunks.push(Buffer.from(chunk))
}
