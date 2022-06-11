import {db} from "#db";
import RenderThread from "svalit"
import {dumpTemplates} from "#lib/template.mjs";
import {readFileSync} from "fs";

const clientLoader = readFileSync(new URL('client.mjs', import.meta.url))

export default class RenderPage extends RenderThread {
    constructor({req, res, imports, ...options} = {}) {
        super(options);
        Object.assign(this, {req, res, imports})
        if (!options.content.loader) this.content.loader = clientLoader
    }

    streamHandler(...args) {
        if (this.meta.status) this.res.status(this.meta.status)
        this.res.setHeader('Content-Disposition', 'inline');
        this.res.setHeader('Access-Control-Allow-Origin', '*');
        this.res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return super.streamHandler(...args)
    }

    footerTemplate(...args) {
        const footer = super.footerTemplate(...args)
        return [
            dumpTemplates(),
            db?.exportCache ? this.scriptTemplate(`window.cache=${db.exportCache()}`) : '',
            this.scriptTemplate(`window.deferredImports=${JSON.stringify(this.imports)}`),
            this.importsTemplate(this.imports),
            footer
        ].join('\n')
    }
}
