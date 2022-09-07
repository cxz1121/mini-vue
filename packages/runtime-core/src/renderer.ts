import { isString, ShapeFlags } from '@vue/shared';
import { createVnode, Text } from './vnode';
export function createRenderer(renderOptions) {
    let {
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText,
        setText: hostSetText,
        querySelector: hostQuerySelector,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        createElement: hostCreateElement,
        createText: hostCreateText,
        patchProp: hostPatchProp
    } = renderOptions

    const normalize = (child) => {
        if(isString(child)) {
            return createVnode(Text, null, child)
        }
        return child
    }
    const mountChildren = (children, container) => {
        for(let i = 0; i < children.length; i++) {
            let child = normalize(children[i])
            patch(null, child, container)
        }
    }

    const mountElement = (vnode, container) => {
        let { type, props, children, shapeFlag } = vnode
        let el = vnode.el = hostCreateElement(type)
        hostInsert(el, container)
        if(props) {
            for (let key in props) {
                hostPatchProp(el, key, null, props[key])
            }
        }
        if(children) {
            if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(el, children)
            } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                mountChildren(children, el)
            }
        }
    }
    const processText = (n1, n2, container) => {
        if(n1 === null) {
            let el = n2.el = hostCreateText(n2.children)
            hostInsert(el, container)
        } else {

        }
    }
    const patch = (n1, n2, container) => {
        if(n1 === n2) return
        const { type, shapeFlag } = n2
        if(n1 == null) {
            //初次渲染 mount
            switch (type) {
                case Text:
                    processText(n1, n2, container)
                    break;
                default:
                    if(shapeFlag & ShapeFlags.ELEMENT) {
                        mountElement(n2, container)
                    }
                    break;
            }
        } else {
            //更新
        }
    }
    const render = (vnode, container) => {
        if(vnode == null) {
            //卸载操作
        } else {
            //初始化 或者 更新
            patch(container._vnode || null, vnode, container)
        }
        container._vnode = vnode
    }
    return {
        render
    }
}
