import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
import { createRender } from "@vue/runtime-core";

// 操作DOM 类型：节点 属性

export const rendererOptionDom = extend({ patchProp }, nodeOps); 

export const createApp = (rootComponent, rootProps = null) => {
  // 高阶函数 实现多平台兼容
  let app: any = createRender(rendererOptionDom).createApp(rootComponent, rootProps);
  const { mount } = app;
  app.mount = (container) => {
   // 挂载
   // 清空容器
   container = nodeOps.querySelector(container);
   container.innerHTML = "";
   // 将组件的渲染元素(虚拟DOM)进行挂载
   mount(container);
  }
  return app;
}


// 1.创建createApp函数 -> 返回一个app对象
// 2.有不同的平台：web、native、小程序、app  rendererOptionDom实现各平台代理
// 3.挂载
// runtime-core 中的createApp创建vnode -> 渲染 -> 挂载
