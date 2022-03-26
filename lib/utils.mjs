import {ObjectId} from "mongodb";

export const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d');

export function fetchTypes(data) {
    return typeof data == 'object' ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, fetchType(value)])) : data;
}

export function fetchType(value) {
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
            if (dateRegex.test(value)) return new Date(value);
            if (ObjectId.isValid(value)) return new ObjectId(value);
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
