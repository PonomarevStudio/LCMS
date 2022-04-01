import {ObjectId} from 'mongodb';

export const defaultTypes = {_id: [ObjectId, Number, String], date: [Date]}

export const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d'); // new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d');

export const chain = (...f) => f.reduce((r, f) => r instanceof Promise ? r.then(f) : f(r))

export function fetchTypes(data, types = defaultTypes, key) {
    if (!data) return data
    if (Array.isArray(data)) return data.map(item => fetchTypes(item, types))
    return typeof data == 'object' ? Object.fromEntries(Object.entries(data).map(([key, value]) =>
        [key, fetchTypes(value, types, key)])) : fetchType(data, types[key])
}

export function fetchType(value, types = [Number]) {
    switch (value) {
        case 'null':
            return null;
        case 'false':
            return false;
        case 'true':
        case 'on':
            return true;
        case '':
            return null;
        default:
            if (types.includes(Date) && dateRegex.test(value)) return new Date(value);
            if (types.includes(Number) && isNumeric(value)) return parseFloat(value);
            if (types.includes(ObjectId) && ObjectId.isValid(value)) return new ObjectId(value);
            return value;
    }
}

export function ArrayFromJSON(json) {
    if (typeof json == 'object' && Array.isArray(json)) return json;
    let data = [json || undefined];
    try {
        data = JSON.parse(json)
    } catch (e) {
    }
    return Array.isArray(data) ? data : [data || undefined]
}

export function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}

export function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0 || Object.getPrototypeOf(obj) === Object.prototype
}
