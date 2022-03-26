import {MongoClient} from 'mongodb'
import ClientDB from "./db.client.mjs";
import {serializeError} from "serialize-error";
import {ArrayFromJSON, fetchTypes} from "#utils";

export const mongo = await MongoClient.connect(process.env.MONGODB)

export default class DB extends ClientDB {
    async request(query = {}, options = {}) {
        const targetQuery = {...this.query, ...query}
        const targetOptions = {...this.options, ...options}
        try {
            if (!targetQuery.collection || !targetQuery.method) throw Error('Collection or method not set')
            const collection = mongo.db(process.env.DB).collection(targetQuery.collection)
            if (!collection[targetQuery.method]) throw Error('Method not available')
            const args = ArrayFromJSON(targetQuery.args).map(fetchTypes)
            let result = await collection[targetQuery.method].apply(collection, args)
            if (targetQuery.chain) result = await ArrayFromJSON(targetQuery.chain).reduce(async (obj, method) => await obj[method](), result)
            return result
        } catch (e) {
            throw {...serializeError(e), query: targetQuery};
        }
    }
}
