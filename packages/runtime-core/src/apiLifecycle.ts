// 生命周期

import { currentInstance, setCurrentInstance } from "./component";

// 枚举
const enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um',
  ERROR_CAPTURED = 'ec',
  RENDER_TRIGGERED = 'rt',
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)

export const onMounted = createHook(LifecycleHooks.MOUNTED);

export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);

export const onUpdate = createHook(LifecycleHooks.UPDATED);

export function injectHook(lifecycle, hook, target) {
  if (target) {
    // 获取当前组件实例
    const hooks = target[lifecycle] || (target[lifecycle] = [])
    // 添加钩子函数
    const wrappedHook = () => {
      // 存储当前组件实例
      setCurrentInstance(target);
      hook();
      setCurrentInstance(null);
    }
    hooks.push(wrappedHook);
  }
}

// 生命周期
function createHook(lifecycle: LifecycleHooks) {
  // 生命周期和当前组件实例关联
  return (hook, target = currentInstance) => {
    injectHook(lifecycle, hook, target)
  };
}

export const invokeArrayFns = (fns: Function[], ...arg: any[]) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg)
  }
}