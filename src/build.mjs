import RenderThread from "svalit"
import RenderPage from "./index.mjs"
import render from "svalit/prerender.mjs"
import {mkdirSync, writeFileSync} from "fs"
import {template, options} from "./template.mjs"
import {siteMap} from "#lib/router.mjs"
import '../components/app-page.mjs'

const RenderPageThread = RenderPage(RenderThread),
    publicDir = new URL('../.vercel/output/static/', import.meta.url)

console.debug('Building to path ', publicDir.href)

mkdirSync(publicDir, {recursive: true})
writeFileSync(new URL('../config.json', publicDir), JSON.stringify({version: 3}))

const renderOptions = {
    renderOptions: {...options, meta: {title: 'LCMS'}},
    renderClass: RenderPageThread,
    origin: process.env.ORIGIN,
    publicDir,
    template
}

const renderedList = new Set()

const getAvailableRoutes = () => [...siteMap.values()].filter(path => !renderedList.has(path)).map(path => ({path}))

const result = await render(renderOptions)

result.forEach(path => renderedList.add(path))

const routes = getAvailableRoutes()

if (routes.length) await render({
    ...renderOptions,
    routes
}).then(result => result.forEach(path => renderedList.add(path)))

console.debug('Complete build', ...renderedList.values())

process.exit()
