export let activeEffect = undefined

function cleanupEffect(effect) {
  const { deps } = effect //key 对应的 effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  deps.length = 0
}

class ReactiveEffect {
  public active = true
  public parent = null
  public deps = []
  constructor(public fn, public scheduler) {

  }
  run() {
    if (!this.active) { //未激活 直接返回执行 不需要依赖收集
      return this.fn()
    }

    //这里就可以依赖收集了
    try {
      this.parent = activeEffect
      activeEffect = this
      //清理之前收集的effect, 之后重新收集
      cleanupEffect(this)
      return this.fn()
    } finally {
      activeEffect = this.parent
    }
  }
  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this)
    }
  }
}


export function effect(fn, options:any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run()

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  
  return runner
}

const targetMap = new WeakMap()
export function track(target, key, type) {
  if(!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  let shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) { //双向收集
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, key, oldValue, newValue, type) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return
  let effects = depsMap.get(key)
  if (effects) {
    effects = new Set(effects)
    effects.forEach(effect => {
      if (effect !== activeEffect) {
        if (effect.scheduler) {
          effect.scheduler()
        } else {
          effect.run()
        }
      }
    })
  }
}