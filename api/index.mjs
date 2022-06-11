import {errorHandler} from "#lib/errorHandler.mjs"
import RenderPage from "../src/index.mjs"
import {readFileSync} from "fs";
import {html} from "lit"

import '../components/app-page.mjs'

const dev = process.env.VERCEL_ENV === 'development', options = {
    dev,
    shim: true,
    importMapOptions: {
        cache: dev,
        ignore: ['mongodb'],
        inputMap: {
            imports: {
                "#root/": "/",
                "#lib/": "/lib/",
                "#utils": "/lib/utils.mjs",
                "#db": "/lib/db/client.mjs",
            }
        }
    },
    imports: ['/components/app-page.mjs'],
    content: {head: readFileSync(new URL('../includes/head.html', import.meta.url))}
}

export default async (req, res) => {
    try {
        const url = `${req.headers['x-forwarded-proto'].split(',').shift()}://${req.headers['x-forwarded-host']}${req.url}`
        const page = new RenderPage({...options, req, res, meta: {title: 'LCMS', url}})
        const output = await page.renderTemplate(({meta: {url, setMeta}}) => html`
            <app-page url="${url}" .setMeta="${setMeta}"></app-page>`)
        res.send(output)
    } catch (e) {
        return errorHandler(e, res)
    }
}
