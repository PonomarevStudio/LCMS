import ObjectID from 'bson-objectid';

export const defaultTypes = {_id: [ObjectID, Number, String], date: [Date]}

export const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d'); // new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d');

export const chain = (...f) => f.reduce((r, f) => r instanceof Promise ? r.then(f) : f(r))

export const all = (a = []) => a.some(p => p instanceof Promise) ? Promise.all(a) : a

export function fetchTypes(data, types = defaultTypes, key) {
    if (!data) return data
    if (Array.isArray(data)) return data.map(item => fetchTypes(item, types))
    return typeof data == 'object' ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, fetchTypes(value, types, key)])) : fetchType(data, types[key])
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
            if (types.includes(ObjectID) && ObjectID.isValid(value)) return new ObjectID(value);
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

export const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export const mergeDeep = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {
                    [key]: {}
                });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {
                    [key]: source[key]
                });
            }
        }
    }
    return mergeDeep(target, ...sources);
}
