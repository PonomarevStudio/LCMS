import RenderPage from "../src/index.mjs"
import RenderStream from "@svalit/vercel"
import {errorHandler} from "#lib/errorHandler.mjs"
import {template, options} from "../src/template.mjs"

const RenderPageStream = RenderPage(RenderStream)

export default (req, res) => {
    try {
        const url = `${req.headers['x-forwarded-proto'].split(',').shift()}://${req.headers['x-forwarded-host']}${req.url}`
        const page = new RenderPageStream({...options, req, res, meta: {title: 'LCMS', url}})
        return page.renderTemplate(template)
    } catch (e) {
        return errorHandler(e, res)
    }
}
