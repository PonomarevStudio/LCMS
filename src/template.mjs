import {html} from "lit"
import {readFileSync} from "fs"
import '../components/app-page.mjs'
import '../components/app-router.mjs'

const dev = process.env.VERCEL_ENV === 'development'

export const options = {
    dev,
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
    shim: {shimMode: true, mapOverrides: true},
    imports: ['/components/app-page.mjs', '/components/app-router.mjs'],
    content: {head: readFileSync(new URL('../includes/head.html', import.meta.url))}
}

export const template = ({meta: {url, setMeta}}) => html`
    <app-page url="${url}" .setMeta="${setMeta}"></app-page>
    <app-router url="${url}"></app-router>`
