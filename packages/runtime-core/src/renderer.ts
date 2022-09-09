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

    const mountElement = (vnode, container, anchor) => {
        let { type, props, children, shapeFlag } = vnode
        let el = vnode.el = hostCreateElement(type)
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
        hostInsert(el, container, anchor)
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
    const patchKeyedChildren = (c1, c2, el) => {
        let i = 0
        let e1 = c1.length - 1
        let e2 = c2.length - 1

        //sync from start
        while(i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if(isSameVnode(n1, n2)) {
                patch(n1, n2, el)
            } else {
                break
            }
            i++
        }

        //sync from en
        while(i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if(isSameVnode(n1, n2)) {
                patch(n1, n2, el)
            } else {
                break
            }
            e1--
            e2--
        }

        console.log('i:'+i, 'e1:'+e1, 'e2:'+e2);

        //common sequence + mount
        if(i > e1 && i <= e2) {
            while(i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < c2.length ? c2[nextPos].el : null
                patch(null, c2[i], el, anchor)
                i++
            }
        }

        //common sequence + unmount
        if(i > e2 && i <= e1) {
            while(i <= e1) {
                unmount(c1[i])
                i++
            }
        }


        //前面优化完毕
        //乱序比对
        let s1 = i
        let s2 = i
        
        const keyToNewIndexMap = new Map() // Map { newkey => index}
        for(let i = s2; i <= e2; i++) {
            keyToNewIndexMap.set(c2[i].key, i)
        }

        console.log(keyToNewIndexMap);


        const toBePatch = e2 - s2 + 1 // 新的总个数
        const newIndexToOldIndexMap = new Array(toBePatch).fill(0) //用来记录新的元素在老的位置 默认为0 处理之后还为0的话 就是新元素 挂载
        for(let i = s1; i <= e1; i++) {
            const oldChild = c1[i]
            let newIndex = keyToNewIndexMap.get(oldChild.key)
            if(!newIndex) {
                unmount(oldChild)
            } else {
                newIndexToOldIndexMap[newIndex - s2] = i + 1 //+1 的目的是 确保 0是未 patch 过的，处理之后还为0的话 就是新元素
                patch(oldChild, c2[newIndex], el)
            }
        }
        console.log(newIndexToOldIndexMap);
        
        //需要移动位置
        for(let i = toBePatch - 1; i >= 0; i--) {
            let index = i + s2
            let current = c2[index]
            let anchor = index + 1 < c2.length ? c2[index + 1].el : null
            if(newIndexToOldIndexMap [i] === 0) {
                patch(null, current, el, anchor)
            } else {
                hostInsert(current.el, el, anchor)
            }
        }

        //最长递增子序列

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
                    patchKeyedChildren(c1, c2, el)
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
    const processElement = (n1, n2, container, anchor) => {
        if(n1 === null) {
            mountElement(n2, container, anchor)
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
    const patch = (n1, n2, container, anchor = null) => {
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
                    processElement(n1, n2, container, anchor)
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
