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
            children[i] = normalize(children[i])
            patch(null, children[i], container)
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
    const unmountChildren = (children) => {
        for (let i = 0; i < children.length; i++) {
            unmount(children[i])
        }
    }
    const patchChildren = (n1, n2, el) => {
        const c1 = n1.children
        const c2 = n2.children

        const preShapeFlag = n1.shapeFlag
        const newShapeFlag = n2.shapeFlag
        //-老的   新的   应操作
        //1文本   文本   不同 就更新文本
        //2文本   数组   清空文本 再挂载
        //3文本   空的   清空文本
        //4空的   文本   设置文本   
        //5空的   数组   挂载
        //6空的   空的   不操作
        //7数组   文本   卸载数组 设置文本
        //8数组   数组   diff算法
        //9数组   空的   卸载数组
        
        if(newShapeFlag && newShapeFlag & ShapeFlags.TEXT_CHILDREN) { //新的是文本
            if(preShapeFlag && preShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //老的是数组
                unmountChildren(c1) //卸载老数组
            }
            hostSetElementText(el, c2) //设置新文本 1 4 7
        } else { //新的是 空 或 数组
            if(preShapeFlag && preShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //老的是数组
                if(newShapeFlag && newShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //老的是数组，新的是数组
                    //diff 8
                } else { //老的是数组，新的是空 9
                    unmountChildren(c1)
                }
            } else { //老的是文本 或 空，新的是数组 或 空 2 3 5 6
                if(preShapeFlag && preShapeFlag & ShapeFlags.TEXT_CHILDREN) { //老的是文本 设置为 空，包含了老的为空
                    hostSetElementText(el, '')
                }
                if(newShapeFlag && newShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //新的为数组 挂载，否则为空 不操作
                    mountChildren(c2, el)
                }
            }
        }

    }
    const patchElement = (n1, n2, container) => {
        let el = n2.el = n1.el
        
        let oldProps = n1.props || {}
        let newProps = n2.props || {}

        patchProps(el, oldProps, newProps)

        patchChildren(n1, n2, el)
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
