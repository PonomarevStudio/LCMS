import RenderThread from "svalit"
import RenderPage from "./index.mjs"
import render from "svalit/prerender.mjs"
import {mkdirSync, writeFileSync} from "fs"
import {template, options} from "./template.mjs"

import '../components/app-page.mjs'

const RenderPageThread = RenderPage(RenderThread),
    publicDir = new URL('../.vercel/output/static/', import.meta.url)

console.debug('Building to path ', publicDir.href)

mkdirSync(publicDir, {recursive: true})
writeFileSync(new URL('../config.json', publicDir), JSON.stringify({version: 3}))

const result = await render({
    renderOptions: {...options, meta: {title: 'LCMS'}},
    renderClass: RenderPageThread,
    origin: process.env.ORIGIN,
    publicDir,
    template
})

console.debug('Complete build', result.length, 'routes')
process.exit()
