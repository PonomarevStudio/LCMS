import fetch from 'node-fetch';

const api = `https://api.jspm.io/generate`

export default async (req, res) =>
    res.json(await (await fetch(api + new URL(req.url, 'https://localhost/').search)).json())
