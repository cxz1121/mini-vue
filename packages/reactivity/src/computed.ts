import { isFunction } from "@vue/shared";
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";

class ComputedRefImpl {
  public effect
  public dirty = true
  public __v_isReadonly = true
  public __v_isRef = true
  public _value
  public dep = new Set()
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this.dirty) {
        this.dirty = true
        triggerEffects(this.dep)
      }
    })
  }
  get value() {
    trackEffects(this.dep)
    if (this.dirty) {
      this.dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}


export function computed(getterOrOtions) {
  let onlyGetter = isFunction(getterOrOtions)
  let getter, setter
  if (onlyGetter) {
    getter = getterOrOtions
    setter = () => { console.warn('no set') }
  } else {
    getter = getterOrOtions.get
    setter = getterOrOtions.set
  }

  return new ComputedRefImpl(getter, setter)
}