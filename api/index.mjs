export default async (req, {json}) => json({
    body: req.body,
    query: req.query,
    cookies: req.cookies,
    headers: req.headers,
    versions: process.versions
})
