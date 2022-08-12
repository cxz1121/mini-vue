export const enum ReactiveFlags {
  isReactive = '__v_isReactive'
}

export const mutableHandler = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.isReactive) {
      return true
    }
    return Reflect.get(target, key, receiver)
  },
  set(target, key, newValue, receiver) {
    return Reflect.set(target, key, newValue, receiver)
  }
}