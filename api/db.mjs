import DB from "#db";

export default async ({query}, {json}) => json(await new DB().request(query).catch(e => ({error: e})))
