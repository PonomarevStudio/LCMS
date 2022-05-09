import {AppField} from "./app-field.mjs";
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

class AppHTML extends AppField {
    render() {
        return unsafeHTML(this.fetchValue() || '')
    }
}

customElements.define('app-html', AppHTML)
