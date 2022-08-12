import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

function traverse(value, set = new Set()) {
  //递归 终结条件 不是对象 就不递归
  if (!isObject(value)) return value
  if (set.has(value)) {
    return value
  }
  set.add(value)
  for (let key in value) {
    traverse(value[key], set)
  }
  return value
}

//source是用户传入的对象, cb是对应用户的回调
export function watch(source, cb) {
  let getter
  
  if (isReactive(source)) {
    getter = () => traverse(source)    
  } else if (isFunction(source)) {
    getter = source
  } else {
    return 
  }

  let cleanup
  let oncleanup = (fn) => {
    cleanup = fn
  }
  let oldValue
  const job = () => {
    if (cleanup) {
      cleanup()
    }
    const newValue = effect.run()
    cb(newValue, oldValue, oncleanup)
    oldValue = newValue
  }

  const effect = new ReactiveEffect(getter, job)

  oldValue = effect.run()
}