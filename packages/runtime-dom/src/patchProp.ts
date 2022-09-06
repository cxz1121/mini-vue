import { patchAttrs } from "./modules/attrs";
import { patchClass } from "./modules/class";
import { pacthEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

export function patchProp(el, key, preValue, newValue) {
    //class style event attrs
    if(key === 'class') {
        patchClass(el, newValue)
    } else if(key === 'style') {
        patchStyle(el, preValue, newValue)
    } else if(/^on[^a-z]/.test(key)) {
        pacthEvent(el, key, newValue)
    } else {
        patchAttrs(el, key, newValue)
    }
}