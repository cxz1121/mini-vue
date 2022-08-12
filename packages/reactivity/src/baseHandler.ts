import { track, trigger } from "./effect"

export const enum ReactiveFlags {
  isReactive = '__v_isReactive'
}

export const mutableHandler = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.isReactive) {
      return true
    }
    track(target, key, 'get')
    return Reflect.get(target, key, receiver)
  },
  set(target, key, newValue, receiver) {
    let oldValue = target[key]
    let result = Reflect.set(target, key, newValue, receiver)
    if (oldValue !== newValue) {
      trigger(target, key, oldValue, newValue, 'set')
    }
    return result
  }
}