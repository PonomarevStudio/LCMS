export let state = {}
export let siteMap = new Set()

export function navigate(e, url) {
    if (e) e.preventDefault()
    const href = url || e.target.href || e.currentTarget.href
    return this.dispatchEvent(new CustomEvent('navigate', {bubbles: true, composed: true, detail: {href}}));
}

export function attachStateProxy() {
    return window.state = state = new Proxy(window.history && window.history.state ? window.history.state : {}, {
        set(target, property, value) {
            target[property] = value;
            if (!window.history.replaceState) return true;
            window.history.replaceState(target, document.title);
            return true
        }
    })
}

export class Router {
    options = {basePath: '/'}

    constructor(host, options = {}) {
        (this.host = host).addController(this)
        Object.assign(this.options, options)
        const baseURL = new URL(this.options.basePath, 'http://localhost')
        if (options.routes) options.routes.forEach(({path}) => siteMap.add(new URL(path, baseURL).pathname))
    }

    outlet() {
        const urlPath = new URL(this.host.url).pathname
        const targetPath = (urlPath.startsWith(this.options.basePath) ? urlPath.replace(this.options.basePath, '') : urlPath) || '/'
        const route = this.options.routes.find(({path}) => path === targetPath) || this.options.fallback
        return route?.render(targetPath) || ''
    }

    navigate(url, skipHistory) {
        if (!skipHistory) {
            if (location.href === url) return;
            history.pushState({referrer: location.href}, 'LCMS', url);
        }
        attachStateProxy()
        this.host.url = url
        document.title = 'LCMS'
        window.scrollTo(0, 0)
    }

    hostConnected() {
        attachStateProxy()
        window.addEventListener('navigate', e => e.detail.href ? this.navigate(e.detail.href, true) : null)
        window.addEventListener('popstate', e => this.navigate(e.target.location.href, true))
    }
}
