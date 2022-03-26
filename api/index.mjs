import API from "#api";

export default async ({query}, {json}) => json(await new API().request(query))
