import {html, LitElement} from "lit"

export const text = 'This component loaded dynamically ! 🔥'

class ImportTest extends LitElement {
    static get properties() {
        return {
            text: {type: String}
        }
    }

    render() {
        return html`
            <p>
                <marquee direction="left" width="300px">${this.text || 'Property not set 🥲'}</marquee>
            </p>`
    }
}

customElements.define('import-test', ImportTest)
