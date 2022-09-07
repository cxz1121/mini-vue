import { isString, ShapeFlags } from '@vue/shared';
import { createVnode, isSameVnode, Text } from './vnode';
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
    const patchProps = (el, oldProps, newProps) => {
        if(newProps) {
            for (let key in newProps) {
                hostPatchProp(el, key, oldProps[key], newProps[key])
            }
        }
        for (let key in oldProps) {
            if(!newProps[key]) {
                hostPatchProp(el, key, oldProps[key], null)
            }
        }
    }
    const patchElement = (n1, n2, container) => {
        let el = n2.el = n1.el
        
        let oldProps = n1.props || {}
        let newProps = n2.props || {}

        patchProps(el, oldProps, newProps)
    }
    const processElement = (n1, n2, container) => {
        if(n1 === null) {
            mountElement(n2, container)
        } else {
            //更新
            patchElement(n1, n2, container)
        }
    }
    const processText = (n1, n2, container) => {
        if(n1 === null) {
            let el = n2.el = hostCreateText(n2.children)
            hostInsert(el, container)
        } else {
            //更新
            let el = n2.el = n1.el
            if(n1.children !== n2.children) {
                hostSetText(el, n2.children)
            }
        }
    }
    const patch = (n1, n2, container) => {
        if(n1 === n2) return

        if(n1 && !isSameVnode(n1, n2)) {
            unmount(n1)
            n1 = null
        }

        const { type, shapeFlag } = n2

        switch (type) {
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if(shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container)
                }
                break;
        }
    }
    const unmount = (vnode) => {
        hostRemove(vnode.el)
    }
    const render = (vnode, container) => {
        if(vnode == null) {
            //卸载操作
            if(container._vnode) {
                unmount(container._vnode)
            }
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
