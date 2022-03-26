export function ArrayFromJSON(json) {
    if (typeof json == 'object' && Array.isArray(json)) return json;
    let data = [json || undefined];
    try {
        data = JSON.parse(json)
    } catch (e) {
    }
    return Array.isArray(data) ? data : [data || undefined]
}
