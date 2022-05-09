import replaceAll from 'string.prototype.replaceall';
import {serializeError} from "serialize-error";
import cleanStack from 'clean-stack';
import {readFileSync} from "fs";

replaceAll.shim();

const isDev = process.env.VERCEL_ENV === 'development';
const readFile = path => readFileSync(new URL(path, import.meta.url))
const page = readFile('../includes/error.html')
const consoleLog = json => `<script async>console.error(Object.assign(new Error(),${json}))</script>`
const pageTemplate = json => `${page}<hr><textarea disabled>${json}</textarea>`

export function errorHandler(e, res) {
    console.error('Handler error:', e)
    res.status(500);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const error = serializeError(e);
    if (error?.stack) error.stack = cleanStack(error.stack, {pretty: true})
        .replaceAll('file://', '')?.split(`\n`)?.map(line => line.trim());
    const json = JSON.stringify(error, null, 2);
    return res.end(pageTemplate(json) + consoleLog(json));
}
