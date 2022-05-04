if (typeof process === 'object') ({readFile: fetch} = await import('fs/promises'))

export const templates = {}

const wrapTemplate = (content, id) => `<template${id ? ` id="${id}"` : ''}>${content}</template>`

export function fetchTemplate(path, id, base) {
    id = id || path
    if (document.getElementById && document.getElementById(id)) return document.getElementById(id).innerHTML
    const url = new URL(path, base)
    return fetch(url).then(r => r.text ? r.text() : r.toString()).then(template => templates[id] = template)
}

export function dumpTemplates() {
    return Object.entries(templates).map(([id, content]) => wrapTemplate(content, id)).join()
}
