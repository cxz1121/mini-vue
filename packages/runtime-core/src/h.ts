import { isObject, isArray } from '@vue/shared';
import { createVnode, isVnode } from "./vnode";

//length === 2
//h('h1', 'hello')
//h('h1', {style: {'color': 'red'}})
//h('h1', h('h2', 'h2'))

//length === 3
//h('h1', {style: {'color': 'red'}}, 'hello')
//h('h1', null, 'hello')
//h('h1', null, h('h2', 'h2'))
//h('h1', null, [h('h2', 'h2')])

//else 
//h('h1', {style: {'color': 'red'}}, 'hello', 'world')
//h('h1', {style: {'color': 'red'}}, 'hello', h('h2', 'h2'))
//h('h1', {style: {'color': 'red'}},  h('h2', 'h2'), h('h2', 'h2'))

//......

export function h(type, propsChildren, children) { //除了3个以外的都是孩子(children)
    let len = arguments.length

    if(len === 2) { //长度为2时
        if(isObject(propsChildren) && !isArray(propsChildren)) { //是对象 且 不是数组
            if(isVnode(propsChildren)) { //是vnode h() => vnode:{}
                return createVnode(type, null, [propsChildren]) //包装成 [vnode:{}]
            }
            return createVnode(type, propsChildren) //是属性 {style: ......}
        } else { //文本 或者 数组
            return createVnode(type, null, propsChildren)
        }
    } else {
        if(len > 3) { //长度大于3时
            children = Array.from(arguments).slice(2)
        } else if(len === 3 && isVnode(children)){ //长度为3时
            children = [children]
        }

        return createVnode(type, propsChildren, children)
    }
}