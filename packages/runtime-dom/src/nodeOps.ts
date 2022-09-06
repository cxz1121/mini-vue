//节点操作 （增删改查）
export const nodeOps = {
    insert(child, parent, anchor = null) {
        parent.insertBefore(child, anchor) //anchor为null 等价于 appendChild
    },
    remove(child) {
        const parentNode = child.parentNode
        if(parentNode) {
            parentNode.removeChild(child)
        }
    },
    setElementText(el, text) {
        el.textContent = text
    },
    setText(node, text) { //textNode
        node.nodeValue = text
    },
    querySelector(selector) {
        return document.querySelector(selector)
    },
    parentNode(node) {
        return node.parentNode
    },
    nextSibling(node) {
        return node.nextSibling
    },
    createElement(tagName) {
        return document.createElement(tagName)
    },
    createText(text) {
        return document.createTextNode(text)
    }
}