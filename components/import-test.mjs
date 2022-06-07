import {html, LitElement} from "lit"
import {chain} from "#lib/utils.mjs";
import {syncImport} from "#lib/loader.mjs";
import {SafeUntil} from "#lib/directives.mjs";

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
        return this.safeUntil(chain(syncImport("fetched-list"), () => html`
            <p>
                <marquee direction="left" width="300px">${this.text || 'Property not set 🥲'}</marquee>
            </p>`), html`<p>Loading...</p>`)
    }
}

customElements.define('import-test', ImportTest)
