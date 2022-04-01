export default class DB {

    constructor(options = {}, cache = globalThis.cache) {
        this.options = Object.assign({apiURL: '/api/db'}, options)
        this.methodsQuery = {find: {chain: 'toArray'}, findOne: {}, aggregate: {chain: 'toArray'}}
        this.cache = cache instanceof Map ? cache : new Map(typeof cache == 'object' ? Object.entries(cache) : undefined)
        this.attachMethods()
    }

    call(method, query = {}, collection = this.options.collection) {
        if (!collection) throw 'Collection not set';
        const args = [method, query, collection]
        return this.getCachedRequest(...args) || this.request(...args).then(result => this.saveRequestCache(result, ...args))
    }

    async request(method, query = {}, collection = this.options.collection) {
        const path = `${this.options.apiURL}/${collection}/${method}`
        const url = new URL(new URL(path, location)).toString()
        const request = await fetch(url, {body: JSON.stringify(query), method: 'POST'})
        let result = await request.clone().text()
        try {
            result = await request.clone().json()
        } catch (e) {
            throw {...e, result};
        }
        return result
    }

    getRequestCacheKey(method, query = {}, collection = this.options.collection) {
        return JSON.stringify({collection, method, query})
    }

    getCachedRequest(...args) {
        const key = this.getRequestCacheKey(...args)
        if (this.cache.has(key)) return this.cache.get(key)
    }

    saveRequestCache(result, ...args) {
        if (result) {
            this.cache.set(this.getRequestCacheKey(...args), result)
        }
        return result
    }

    attachMethods() {
        Object.entries(this.methodsQuery).forEach(([method, query]) =>
            this[method] = (...args) => this.call(method, {...query, args}), this)
    }

    collection(collection = this.options.collection) {
        return new this.constructor({...this.options, collection}, this.cache)
    }

}

export const db = new DB()
