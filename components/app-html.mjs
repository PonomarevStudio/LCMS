import {AppField} from "./app-field.mjs";
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

class AppHTML extends AppField {
    render() {
        return unsafeHTML(this.fetchValue() || `<slot></slot>`)
    }
}

customElements.define('app-html', AppHTML)
