import {html, LitElement} from "lit"
import {chain} from "@svalit/core/utils.mjs";
import {syncImport} from "@svalit/core/loader.mjs";
import {SafeUntil} from "@svalit/core/directives.mjs";

const FetchedList = await import("fetched-list")

export const text = 'This component loaded dynamically ! 🔥'

class ImportTest extends LitElement {
    safeUntil = new SafeUntil(this)

    static get properties() {
        return {
            text: {type: String}
        }
    }

    render() {
        return this.safeUntil(chain(syncImport("fetched-list", import.meta.url), () => html`
            <p>
                <marquee direction="left" width="300px">${this.text || 'Property not set 🥲'}</marquee>
            </p>`), html`<p>Loading...</p>`)
    }
}

customElements.define('import-test', ImportTest)
