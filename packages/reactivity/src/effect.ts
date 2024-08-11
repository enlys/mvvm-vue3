// effect 收集依赖及更新

import { isArray, isIntegerKey } from "@vue/shared";
import { TriggerOpTypes } from "./constants";

export function effect(fn, options: any = {}) {
  const effect = createReactIveEffect(fn, options);
  // 是否懒模式
  if (!options.lazy) {
    effect();
  }
  return effect;
}

let uid = 0;
let activeEffect: any;
const effectStack = [];
function createReactIveEffect(fn: any, options: any) {
  const effect = function reactiveEffect(){ // 响应式的effect
    if (!effectStack.includes(effect)) {
      try {
        // 入栈
        effectStack.push(effect);
        activeEffect = effect;
        return fn(); // 执行用户方法
      } finally {
        // 出栈
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  }
  effect.id = uid++;  // 唯一标识
  effect._isEffect = true;  // 是否是effect
  effect.raw = fn;   // 原始方法
  effect.options = options; // 用户的属性
  effect.run = function () {
    effect();
  }
  return effect;
}


// 收集effect 主要在get方法中使用
export const targetMap = new WeakMap();

export function track(target, type,  key) {
  // 获取当前effect没有在激活中的直接返回不进行收集
  if (!activeEffect) return;
  // 获取target对应的depsMap
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  // 去重       
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}



// 触发更新函数
export function trigger(target, type, key, newValue, oldValue?) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  // 取出依赖当前key的所有effect并执行
  // 去重
  let effectSet = new Set();
  const add = (effects) => {
    if (effects) {
      effects.forEach(effect => {
        if (effect !== activeEffect) {
          effectSet.add(effect);
        }
      })
    }
  }
  
  // 特殊处理 length
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      // 设置的长度比原始的长度小的情况
      if (key === 'length' || key >= newValue) {
        add(dep);
      }
    })
  } else {
    // 修改对象或数组key
    if (key !== void 0) {
      add(depsMap.get(key));
    }

    // 修改数组索引
    switch(type) {
      case TriggerOpTypes.ADD:
        if (isArray(target)) {
          if (isIntegerKey(key)) {
            add(depsMap.get('length'));
          }
        }
    }

  }
  effectSet.forEach((effect: any) => {
    if (effect !== activeEffect) {
      if (effect.options.scheduler) {
        effect.options.scheduler(effect);
      } else {
        effect();
      }
    }
  })
} 