import {ArrayFromJSON} from "#utils";
import mongo from "#db";

export default class API {
    async request(query) {
        if (!query.collection || !query.method) return query
        const collection = mongo.db("LCMS").collection(query.collection)
        if (!collection[query.method]) return query
        let result = await collection[query.method].apply(collection, ArrayFromJSON(query.args))
        if (query.chain) result = await ArrayFromJSON(query.chain).reduce(async (obj, method) => await obj[method](), result)
        return result
    }
}
