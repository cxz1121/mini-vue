export function isObject(value) {
  return typeof value === 'object' && value !== null
}

export function isString(value) {
  return typeof value === 'string'
}

export function isNumber(value) {
  return typeof value === 'number'
}

export function isFunction(value) {
  return typeof value === 'function'
}

export const isArray = Array.isArray

export const assign = Object.assign