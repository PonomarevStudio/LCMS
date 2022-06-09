import {errorHandler} from "#lib/errorHandler.mjs"
import RenderThread from "#root/src/index.mjs"
import {html} from "lit"

import '../components/app-page.mjs'

export default (req, res) => new RenderThread(req, res, {
    page: {
        title: 'LCMS',
        template: ({page: {url, setMeta}}) => html`
            <app-page url="${url}" .setMeta="${setMeta}"></app-page>`
    },
    isDev: process.env.VERCEL_ENV === 'development',
    root: new URL('../', import.meta.url).href
}).renderTemplate().catch(e => errorHandler(e, res))
