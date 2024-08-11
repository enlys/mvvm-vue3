import { createVNode } from "./vnode";

export function apiCreateApp(render) {
  return function createApp(rootComponent, rootProps) { // 告诉是那个组件、那个属性
    let app = {
      // 添加属性
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      mount(container) {
        // 创建vnode
        const vnode = createVNode(rootComponent, rootProps);
        // 渲染到指定位置
        render(vnode, container);
      }
    }
    return app;
  }
}