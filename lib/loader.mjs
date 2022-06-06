const appBase = typeof process === 'object' ? process.env.PWD : location.origin

export const imports = {}

export function syncImport(path, base = appBase) {
    const url = new URL(path, base).href
    const id = url.split(appBase).pop()
    if (imports[id]) return imports[id]
    return import(url).then(module => imports[id] = module)
}
