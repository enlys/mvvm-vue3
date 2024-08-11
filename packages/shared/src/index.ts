export * from './shapeFlags'

export function isObject(val) {
  return val !== null && typeof val === "object";
}

export const isArray = Array.isArray
export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
export const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue);
};

export const isFunction = (val) => typeof val === "function";
export const isString = (val) => typeof val === "string";
export const isNumber = (val) => typeof val === "number";
export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key;

export const extend = Object.assign;