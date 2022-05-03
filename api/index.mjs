import {createRenderThread} from "../lib/page.mjs"
import {errorHandler} from "../lib/errorHandler.mjs"

export default async (req, res) => {
    try {
        await createRenderThread(req, res)
    } catch (e) {
        return errorHandler(e, res)
    }
}
