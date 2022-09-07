export function patchStyle(el, preValue, newValue) {
    if(preValue && newValue) {
        for (let key in newValue) {
            el.style[key] = newValue[key]
        }
        for(let key in preValue) {
            if(!newValue || newValue[key] == null) {
                el.style[key] = null
            }
        }
    } else {
        if(preValue) {
            for(let key in preValue) {
                el.style[key] = null
            }
        } else if(newValue) {
            for (let key in newValue) {
                el.style[key] = newValue[key]
            }
        }
    }
}