import {ObjectId} from "mongodb";

export const defaultTypes = {_id: [ObjectId, Number, String]}

export const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d');

export function fetchTypes(data, types = defaultTypes) {
    return typeof data == 'object' ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, fetchType(value, types[key])])) : data;
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

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}
