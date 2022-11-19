import 'lit/experimental-hydrate-support.js'
import {syncImport} from '@svalit/core/loader.mjs'
import {hydrateShadowRoots} from '@webcomponents/template-shadowroot'

if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) hydrateShadowRoots(document.body)

if (window.imports) await Promise.all(window.imports.map((url) => syncImport(url)))
if (window.deferredImports) await Promise.all(window.deferredImports.map((url) => syncImport(url)))
