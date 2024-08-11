import { isArray, isObject } from "@vue/shared";
import { createVNode, isVnode } from "./vnode";

export function h(type, propsOrChildren, children) {
  // 参数
  const i = arguments.length;
  if (i === 2) {
    // 元素 + 属性  元素 + 子元素
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // h('div', h('div', {})))
      if (isVnode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      // 元素 + 属性
      return createVNode(type, propsOrChildren);
    } else {
      // 元素 + 子元素
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (i > 3) {
      children = Array.from(arguments).slice(2);
    } else if (i === 3 && isVnode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}