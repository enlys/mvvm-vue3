// 创建虚拟节点 

import { isArray, isFunction, isObject, isString, ShapeFlags } from "@vue/shared";

// createVNode h()内部是一样的
// h('div', {}, 'hello')
// h(App, {msg: 'hello'})
// h(App, {msg: 'hello'}, [h('div', {}, 'hello')])
export const createVNode = (type, props, children = null) => {
  // 标识是组件还是元素
  const shapeType = isString(type) ? ShapeFlags.ELEMENT :
  isObject(type) ? ShapeFlags.STATEFUL_COMPONENT :
  isFunction(type) ? ShapeFlags.FUNCTIONAL_COMPONENT : 0;
  const vnode = {
    _v_isVNode: true, // 标识是虚拟节点
    type,
    props,
    children,
    key: props && props.key, // 获取key diff使用
    el: null, // 存储真实节点
    shapeType,
    component: {},
  };
  // 儿子标识
  normalizeChildren(vnode, children);

  return vnode;
}

function normalizeChildren(vnode: {
  _v_isVNode: boolean; // 标识是虚拟节点
  type: any; props: any; children: any; key: any; // 获取key diff使用
  el: any; // 存储真实节点
  shapeType: number;
}, children: any) {
  let type = 0;
  if (children == null) {
    return;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }
  vnode.shapeType = vnode.shapeType | type; // 00000001 | 00000010 = 00000011
}

export function isVnode(vnode) {
  return vnode._v_isVNode;
}

export const TEXT = Symbol('text');
export function CVnode(child) {
 // ['text', h('div')]
 if (isString(child) || isObject(child)) {
   return createVNode(TEXT, null, child);
 } else {
   return child;
 }
}