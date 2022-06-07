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

    setCount(value) {
        this.count = value
        if (window.state) window.state.count = this.count
    }

    firstUpdated() {
        this.count = (window.state ? parseInt(state.count) : 0) || 0
    }

    render() {
        return html`
            <button @click="${() => this.setCount(--this.count)}">-</button>
            <output>${this.count || 0}</output>
            <button @click="${() => this.setCount(++this.count)}">+</button>`
    }
}

customElements.define('simple-counter', SimpleCounter)
