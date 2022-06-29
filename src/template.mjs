import {html} from "lit"
import {readFileSync} from "fs"
import '../components/lit-router.mjs'

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
    imports: ['/components/lit-router.mjs'],
    content: {head: readFileSync(new URL('../includes/head.html', import.meta.url))}
}

export const template = ({meta: {url, setMeta}}) => html`
    <lit-router url="${url}" .setMeta="${setMeta}"></lit-router>`
