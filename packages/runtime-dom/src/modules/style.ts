export function patchStyle(el, preValue, newValue) {
    for (let key in newValue) {
        el.style[key] = newValue[key]
    }
    if(preValue) {
        for(let key in preValue) {
            if(newValue[key] == null) {
                el.style[key] = null
            }
        }
    }
}