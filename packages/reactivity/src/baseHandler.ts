import { isObject } from '@vue/shared';
import { track, trigger } from "./effect"
import { reactive, readonly } from './reactive';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const readonlySet = createSetter(true)
const shallowReadonlyGet = createGetter(true, true)
const shallowReadonlySet = readonlySet

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key, receiver)
    if(shallow) {
      return res
    }
    if (!isReadonly) {
      track(target, key, 'get')
    }
    if(isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

function createSetter(isReadonly = false, shallow = false) {
  if(isReadonly) {
    return function set(target, key, newValue, receiver) {
      console.warn(`key: ${key} set fail, target is readonly`)
      return true
    }
  } else {
    return function set(target, key, newValue, receiver) {
      const oldValue = target[key]
      const res = Reflect.set(target, key, newValue, receiver)
      if (oldValue !== newValue) {
        //触发更新
        trigger(target, key, oldValue, newValue, 'set')
      }
      return res
    }
  }
}

export const mutableHandler = {
  get,
  set
}

export const readonlyHandler = {
  get: readonlyGet,
  set: readonlySet
}

export const shallowReadonlyHandler = {
  get: shallowReadonlyGet,
  set: shallowReadonlySet
}