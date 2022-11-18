import {html, css, LitElement} from "lit"

export class SimpleCounter extends LitElement {
    static get properties() {
        return {count: {state: true}}
    }

    static get styles() {
        return css`
          button {
            font-size: inherit;
            touch-action: manipulation;
          }`
    }

    constructor() {
        super();
        this.updateCount();
    }

    setCount(value) {
        this.count = value
        if (window.state) window.state.count = this.count
    }

    updateCount() {
        if (!window.state) return;
        this.count = parseInt(window?.state?.count) || 0;
        this.state = true;
    }

    firstUpdated() {
        if (!this.state) setTimeout(() => requestAnimationFrame(() => this.updateCount()), 0)
    }

    render() {
        return html`
            <button @click="${() => this.setCount(--this.count)}">-</button>
            <output>${this.count}</output>
            <button @click="${() => this.setCount(++this.count)}">+</button>`
    }
}

customElements.define('simple-counter', SimpleCounter)
