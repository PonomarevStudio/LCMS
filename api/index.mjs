import {render} from "@lit-labs/ssr/lib/render-with-global-dom-shim.js";
import {readableFrom} from '@lit-labs/ssr/lib/readable.js';
import {serializeError} from "serialize-error";
import EventEmitter from "events";
import {html} from "lit";
import {db} from "#db";

export default async (req, res) => {
    try {
        await createRenderThread(req, res)
    } catch (e) {
        return errorHandler(e, res)
    }
}

async function createRenderThread(req, res) {
    const chunks = [];
    const myEmitter = new EventEmitter();

    myEmitter.once('meta', meta => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Disposition', 'inline');
        res.write(`<!DOCTYPE html><html lang="ru"><head><title>LCMS</title>
            <meta content="dark light" name="color-scheme">
            <meta content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" name="viewport">
            <script src="https://polyfill.io/v3/polyfill.min.js?features=globalThis" async noshim></script>
            <script src="https://unpkg.com/es-module-shims/dist/es-module-shims.js" async noshim></script>
            </head><body>`);
        res.write(Buffer.concat(chunks));
        stream.pipe(res, {end: false});
    })

    const page = await db.collection('pages').findOne({path: 'index'})

    const stream = await readableFrom(render(html`<h1>${page.title}</h1><p>${page.content}</p>`,
        {customElementHostStack: []}), true);

    stream.on('end', () => {
        myEmitter.emit('meta', {})
        res.end(`</body></html>`)
    });

    for await (let chunk of stream) {
        chunks.push(Buffer.from(chunk))
    }
}

const isDev = process.env.VERCEL_ENV === 'development';

const errorScreenTemplate = json => `<meta name="robots" content="noindex"><style>body{margin: unset;}</style>
<div style="all:initial;font-family:Helvetica,sans-serif;box-sizing: border-box;height:calc(100vh - 4px);padding: 20px 20px 0;display: flex;flex-direction: column">
<h1>На сайте произошла ошибка</h1><div><span>Попробуйте <a href="" onclick="location.reload()">перезагрузить</a> страницу или вернитесь на <a href="/">главную</a></span></div>
${isDev ? `<textarea disabled style="font-family:Helvetica,sans-serif;box-sizing: border-box;width:100%;height:100%;padding: 20px 0;margin:20px 0 0;border: unset;font-size: 20px;white-space: pre-wrap;word-break: break-word;">${json}</textarea>` : ''}
</div><script async>console.error(Object.assign(new Error(),${json}))</script></body></html>`;

function errorHandler(e, res) {
    console.error('Handler error:', e)
    res.status(500);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const error = serializeError(e);
    if (error.stack) error.stack = error?.stack?.split(`\n`)?.map(line => line.trim());
    const json = JSON.stringify(serializeError(error), null, 2);
    return res.end(errorScreenTemplate(json));
}
