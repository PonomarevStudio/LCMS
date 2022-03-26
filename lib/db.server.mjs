import {ArrayFromJSON} from "#utils";
import ClientDB from "./db.client.mjs";
import {MongoClient, ObjectId} from 'mongodb'
import {serializeError} from "serialize-error";

export const mongo = await MongoClient.connect(process.env.MONGODB)

export default class DB extends ClientDB {
    static dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d');

    static fetchTypes(data) {
        return typeof data == 'object' ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, this.fetchType(value)])) : data;
    }

    static fetchType(value) {
        switch (value) {
            case 'null':
                return null;
            case 'false':
                return false;
            case 'true':
            case 'on':
                return true;
            case '':
                return null;
            default:
                if (this.dateRegex.test(value)) return new Date(value);
                if (ObjectId.isValid(value)) return new ObjectId(value);
                return value;
        }
    }

    async request(query = {}, options = {}) {
        const targetQuery = {...this.query, ...query}
        const targetOptions = {...this.options, ...options}
        try {
            if (!targetQuery.collection || !targetQuery.method) throw Error('Collection or method not set')
            const collection = mongo.db(process.env.DB).collection(targetQuery.collection)
            if (!collection[targetQuery.method]) throw Error('Method not available')
            const args = ArrayFromJSON(targetQuery.args).map(this.constructor.fetchTypes.bind(this.constructor))
            let result = await collection[targetQuery.method].apply(collection, args)
            if (targetQuery.chain) result = await ArrayFromJSON(targetQuery.chain).reduce(async (obj, method) => await obj[method](), result)
            return result
        } catch (e) {
            throw {...serializeError(e), query: targetQuery};
        }
    }
}
