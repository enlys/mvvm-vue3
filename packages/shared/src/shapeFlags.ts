
export enum ShapeFlags {
  ELEMENT = 1, // 原生元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
  STATEFUL_COMPONENT = 1 << 2,   // 有状态组件
  TEXT_CHILDREN = 1 << 3, // 文本
  ARRAY_CHILDREN = 1 << 4, // 数组
  SLOTS_CHILDREN = 1 << 5, // 插槽
  TELEPORT = 1 << 6, // teleport 把组件渲染到其他地方
  SUSPENSE = 1 << 7, // suspense 懒加载
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 组件需要被缓存
  COMPONENT_KEPT_ALIVE = 1 << 9, // 组件需要被缓存
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 组件
}
