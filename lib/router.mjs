export let state = {}

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
