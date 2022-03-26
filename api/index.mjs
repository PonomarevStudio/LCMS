import DB from "#db";

export default async ({query}, {json}) =>
    json(await new DB().collection('pages').findOne({path: query.page}).catch(e => ({error: e})))
