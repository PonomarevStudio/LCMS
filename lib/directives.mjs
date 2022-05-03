import {serverUntil} from "@lit-labs/ssr-client/directives/server-until.js";

export const syncUntil = (p, ...args) => p instanceof Promise ? serverUntil(p, ...args) : p;
