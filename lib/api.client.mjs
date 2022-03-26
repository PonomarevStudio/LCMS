export default class API {
    async request(query = {}, {returnErrors = false} = {}) {
        if (!query.collection || !query.method) return query;
        const path = `/api/${query.collection}/${query.method}`;
        const params = {...query};
        delete params.collection;
        delete params.method;
        const request = await fetch(new URL('?' + new URLSearchParams(params).toString(), new URL(path, location)))
        let result = await request.clone().text()
        try {
            result = await request.clone().json()
        } catch (e) {
            if (returnErrors) console.error(e); else throw {...e, result};
        }
        return result
    }
}
