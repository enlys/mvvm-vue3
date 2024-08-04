// 高阶函数创建响应式对象 柯里化
import { isObject } from '@vue/shared';
import { ReactiveFlags } from './constants';
import { 
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers
} from './baseHandlers';

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

// 存储已经代理过的target -> proxy
export const reactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();
export function reactive(target) {
  return cerateReactiveObject(target, false, mutableHandlers, reactiveMap);
}

export function shallowReactive(target) {
  return cerateReactiveObject(target, false, shallowReactiveHandlers, reactiveMap);
}

export function readonly(target) {
  return cerateReactiveObject(target, true, readonlyHandlers, readonlyMap);
}

export function shallowReadonly(target) {
  return cerateReactiveObject(target, true, shallowReadonlyHandlers, readonlyMap);
}

// 考虑 1: 是不是只读 2: 是不是深层次
function cerateReactiveObject(target, isReadonly, baseHandlers, proxyMap) {
  // 不是对象不能执行代理操作
  if (!isObject(target)) {
    console.log(
      `value cannot be made ${isReadonly ? 'readonly' : 'reactive'}: ${String(
        target,
      )}`
    );
    return target;
  }
  // 已经代理过直接返回
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}

export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value