// 操作节点
export const nodeOps = {
  // 创建元素 源码是跨平台的
  createElement: (tagName) =>  {
    return document.createElement(tagName);
  },
  remove: child => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null); // anchor为空则插入到末尾
  },
  querySelector: selector => document.querySelector(selector),
  setElementText: (el, text) => {
    el.textContent = text;
  }, 
  // 文本节点
  createText: text => document.createTextNode(text),
  setText: (node, text) => {
    node.nodeValue = text;
  }
}