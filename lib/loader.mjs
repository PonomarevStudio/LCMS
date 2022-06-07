const appBase = typeof process === 'object' ? process.env.PWD : location.origin

export const imports = {}

export function syncImport(path, base = appBase) {
    let url = path;
    let id = path;
    if (path.startsWith('/') || path.startsWith('.')) try {
        url = new URL(path, base).href
        id = url.split(appBase).pop()
    } catch (e) {
        console.error(e)
    }
    if (imports[id]) return imports[id]
    return import(url).then(module => imports[id] = module)
}
