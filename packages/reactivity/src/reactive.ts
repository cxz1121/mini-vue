import { isObject } from "@vue/shared";
import { mutableHandler, ReactiveFlags } from "./baseHandler";

const reactiveMap = new WeakMap()

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.isReactive])
}

export function reactive(target) {
  if (!isObject(target)) return

  if (target[ReactiveFlags.isReactive]) {
    return target
  }

  let exisitingProxy = reactiveMap.get(target)
  if (exisitingProxy) {
    return exisitingProxy
  }
  
  const proxy = new Proxy(target, mutableHandler)

  reactiveMap.set(target, proxy)
  return proxy
}