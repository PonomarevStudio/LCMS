import {db} from "#db";
import {readFileSync} from "fs";
import {dumpTemplates} from "#lib/template.mjs";

const clientLoader = readFileSync(new URL('client.mjs', import.meta.url))
const esmsUrl = `https://ga.jspm.io/npm:es-module-shims@1.5.5/dist/es-module-shims.js`

export const RenderPage = renderClass => class extends renderClass {
    constructor({imports, ...options} = {}) {
        super(options);
        Object.assign(this, {imports})
        if (!options?.content?.loader) this.content.loader = clientLoader
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

    shimScripts(source) {
        return this.scriptTemplate(undefined, {src: esmsUrl, async: null, noshim: null}) +
            source.replaceAll('type="importmap"', 'type="importmap-shim"').replaceAll('type="module"', 'type="module-shim"')
    }
}

export default RenderPage
