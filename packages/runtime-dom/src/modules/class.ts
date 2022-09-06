export function patchClass(el, newValue) {
    if(newValue == null) {
        el.removeAttribute('class')
    } else {
        el.className = newValue
    }
}