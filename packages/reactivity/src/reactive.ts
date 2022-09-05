import { isObject } from "@vue/shared";
import { mutableHandler, ReactiveFlags, readonlyHandler, shallowReadonlyHandler } from "./baseHandler";

const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
const shallowReadonlyMap = new WeakMap()

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

export function isReadonly(value) {
  return !!(value && value[ReactiveFlags.IS_READONLY])
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

function createReactiveObject(target, baseHandler, proxyMap) {
  if (!isObject(target)) return
  // if (isProxy(target)) return target
  let exisitingProxy = proxyMap.get(target)
  if (exisitingProxy) {
    return exisitingProxy
  }
  const proxy = new Proxy(target, baseHandler)
  proxyMap.set(target, proxy)
  return proxy
}

export function reactive(target) {
  if (isReactive(target)) return target
  return createReactiveObject(target, mutableHandler, reactiveMap)
}

export function readonly(target) {
  if (isReadonly(target)) return target
  return createReactiveObject(target, readonlyHandler, readonlyMap)
}

export function shallowReadonly(target) {
  if (isReadonly(target)) return target
  return createReactiveObject(target, shallowReadonlyHandler, shallowReadonlyMap)
}