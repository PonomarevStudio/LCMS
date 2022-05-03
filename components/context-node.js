import {chain} from "#utils";
import {html, LitElement} from "lit"
import {syncUntil} from "../lib/directives.mjs";
import {ContextController} from "../lib/context.mjs";

class ContextNode extends LitElement {
    context = new ContextController(this, {anyProperty: true});

    fetchJSONData() {
        if (!this.renderRoot || !this.renderRoot.querySelector) return;
        const jsonNode = this.renderRoot.querySelector('script[type="application/json"]')
        if (!jsonNode) return;
        Object.assign(this, JSON.parse(jsonNode.innerText))
        return jsonNode.innerText
    }

    assignPropertyData(data) {
        if (!data) return {}
        delete this.data;
        Object.assign(this, data)
        return data;
    }

    renderJSON(json, data) {
        return `<script type="application/json">${json || JSON.stringify(data, null, 4)}</script>`
    }

    render() {
        const json = this.fetchJSONData()
        const data = chain(this.data, this.assignPropertyData.bind(this))
        return syncUntil(chain(data, data => html([`${this.renderJSON(json, data)}<slot></slot>`])))
    }
}

customElements.define('context-node', ContextNode)
