import {db} from "#db";
import {readFileSync} from "fs";
import {dumpTemplates} from "#lib/template.mjs";

const clientLoader = readFileSync(new URL('client.mjs', import.meta.url))

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
}

export default RenderPage
