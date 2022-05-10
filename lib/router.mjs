export function navigate(e, url) {
    if (e) e.preventDefault()
    const href = url || e.target.href || e.currentTarget.href
    return this.dispatchEvent(new CustomEvent('navigate', {bubbles: true, composed: true, detail: {href}}));
}
