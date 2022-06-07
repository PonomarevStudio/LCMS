import RenderThread from "#root/src/index.mjs"
import {html} from "lit"

import '../components/app-page.mjs'

export default (req, res) => new RenderThread(req, res, {
    page: {
        title: 'LCMS',
        template: ({page: {url, setMeta}}) => html`
            <app-page url="${url}" .setMeta="${setMeta}"></app-page>`
    },
    root: new URL('../', import.meta.url).href
}).renderTemplate()
