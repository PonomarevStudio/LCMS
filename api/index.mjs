import {serializeError} from "serialize-error";
import {db} from "#db";

// TODO: LCMS server-side loader wrapper for Vercel

export default async (req, res) => {
    try {
        // TODO: Loading root components via SVALit
        return res.json(await db.collection('pages').findOne({path: 'index'}))
    } catch (e) {
        return errorHandler(e, res)
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
