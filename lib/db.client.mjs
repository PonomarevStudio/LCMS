export default class DB {
    constructor(query = {}, options = {apiURL: '/api/db'}) {
        this.query = query
        this.options = options
        this.methodsQuery = {find: {chain: 'toArray'}, findOne: {}}
        this.attachMethods()
    }

    async request(query = {}, options = {}) {
        const targetQuery = {...this.query, ...query}
        const targetOptions = {...this.options, ...options}
        if (!targetQuery.collection || !targetQuery.method) return targetQuery;
        const path = `${targetOptions.apiURL}/${targetQuery.collection}/${targetQuery.method}`;
        const params = Object.fromEntries(Object.entries({...targetQuery}).map(([key, value]) =>
            [key, typeof value == 'object' ? JSON.stringify(value) : value]));
        delete params.collection;
        delete params.method;
        const request = await fetch(new URL('?' + new URLSearchParams(params).toString(), new URL(path, location)))
        let result = await request.clone().text()
        try {
            result = await request.clone().json()
        } catch (e) {
            if (targetOptions.returnErrors) console.error(e); else throw {...e, result};
        }
        return result
    }

    attachMethods() {
        Object.entries(this.methodsQuery).forEach(([method, query]) => this[method] = (...args) => {
            if (!this.query.collection) throw 'Collection not set';
            return this.request({method, args, ...query})
        }, this)
    }

    collection(id) {
        return new this.constructor({...this.query, collection: id}, this.options)
    }
}
