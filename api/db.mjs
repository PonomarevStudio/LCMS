import {serializeError} from "serialize-error";
import {db} from "#db";

export default async ({query: {collection, method}, body}, {json}) => {
    try {
        let query = {}
        if (body) try {
            query = JSON.parse(body)
        } catch (e) {
            console.error(e, body)
        }
        return json(await db.call(method, query, collection))
    } catch (e) {
        return json({error: serializeError(e)})
    }
}
