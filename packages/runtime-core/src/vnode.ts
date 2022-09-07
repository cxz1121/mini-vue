import { isArray, isString, ShapeFlags } from "@vue/shared";

export const Text = Symbol('Text') //文本标识

export function isVnode(value) {
    return !!(value && value.__v_isVnode)
}

export function createVnode(type, props, children = null) {
    let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

    const vnode = {
        el: null, //虚拟节点上的真实dom节点，后续diff算法
        type,
        props,
        children,
        shapeFlag,
        __v_isVnode: true,
        key: props?.['key'],
    }

    if(children) {
        let type = 0
        if(isArray(children)) {
            type = ShapeFlags.ARRAY_CHILDREN
        } else {
            children = String(children)
            type = ShapeFlags.TEXT_CHILDREN
        }
        vnode.shapeFlag |= type
    }

    return vnode
}