import {serializeError} from "serialize-error";
import {db} from "#db";

export default async ({query}, {json}) =>
    json(await db.collection('pages').findOne({path: query.page}).catch(e => ({error: serializeError(e)})))
