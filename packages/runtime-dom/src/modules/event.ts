function createInvoker(callback) {
    let invoker: any = (e) => invoker.value(e)
    invoker.value = callback
    return invoker
}

export function pacthEvent(el, eventName, newValue) {
    let invokers = el._vei || (el._vei = {})
    
    let exist = invokers[eventName]

    if(exist && newValue) {
        exist.value = newValue
    } else {
        let event = eventName.slice(2).toLowerCase()

        if(newValue) {
            let invoker = invokers[eventName] = createInvoker(newValue)
            el.addEventListener(event, invoker)
        } else if(exist) {
            el.removeEventListener(event, exist)
            invokers[eventName] = undefined
        }
    }
}