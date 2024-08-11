import { isFunction, isObject, ShapeFlags } from "@vue/shared";
import { componentPublicInstance } from "./componentPublicInstance";

export const getCurrentInstance = () => currentInstance;

export const setCurrentInstance = (instance) => {
  currentInstance = instance;
}
export const createComponentInstance = (vnode) => {
  const instance = {
    vnode,
    type: vnode.type, // 组件的类型
    props: {}, // 组件的属性
    attrs: {}, // 组件的属性 attrs全量
    setupState: null, // setup返回的响应式数据
    ctx: {}, // 代理 
    proxy: {}, // 上下文
    data: {},
    render: false,
    isMounted: false, // 是否挂载
  };
  instance.ctx = { _: instance };
  return instance;
}

// 解析数据到组件实例上
export const setupComponent = (instance) => {
  const { props, children } = instance.vnode;
  instance.props = props; // 源码为initProps
  instance.children = children; //slots 插槽
  // 实例暴露到全局 组件实例关联生命周期
  // 是否有setup
  if (instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT ) { // 4 表示有setup
    // 获取到setup返回的数据
    setUpStateComponent(instance);
  }

}


export let currentInstance;
function setUpStateComponent(instance) {
  // 代理
  instance.proxy = new Proxy(instance.ctx, componentPublicInstance);
  let Component = instance.type;
  
  let { setup }  = Component;
  // 获取setup
  if (setup) {
    // 创建全局的 currentInstance
    currentInstance = instance;
    const setupContext = createSetupContext(instance);
    const setupResult = setup(instance.props, setupContext);
    // 重置
    currentInstance = null;
    handleSetupResult(instance, setupResult);
    
  } else {
    finishComponentSetup(instance);
  }
  
  // // 处理render
  // Component.render(instance.proxy);
}

function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  }
}

// 挂载组件
export const setupRenderEffect = (instance) => {
}

// 处理render
function finishComponentSetup(instance: any) {
  let Component = instance.type;
  // 组件实例上没有render
  if (!instance.render) {
    // 模版编译
    if (!Component.render && Component.template) {
      // 模版->render
      // Component.render = compile(Component.template);
    }
    instance.render = Component.render;
  }
   
  
}
function handleSetupResult(instance: any, setupResult: any) {
  // 1. setup返回的是一个函数
  if (isFunction(setupResult)) {
    instance.render = setupResult;
  }
  // 2. setup返回的是一个对象
  if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }
  // 执行render
  finishComponentSetup(instance);
}

