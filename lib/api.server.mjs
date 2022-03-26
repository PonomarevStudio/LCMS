import {ArrayFromJSON} from "#utils";
import {ObjectId} from 'mongodb';
import mongo from "#db";

export default class API {
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

    async request(query) {
        if (!query.collection || !query.method) return query
        const collection = mongo.db(process.env.DB).collection(query.collection)
        if (!collection[query.method]) return query
        const args = ArrayFromJSON(query.args).map(this.constructor.fetchTypes.bind(this.constructor))
        let result = await collection[query.method].apply(collection, args)
        if (query.chain) result = await ArrayFromJSON(query.chain).reduce(async (obj, method) => await obj[method](), result)
        return result
    }
}
