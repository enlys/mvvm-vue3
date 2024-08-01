import { isObject } from "@vue/shared";
import { ReactiveFlags } from "./constants";
import { reactive, reactiveMap, readonly, readonlyMap, Target } from "./reactive";

class BaseReactiveHandler implements ProxyHandler<Target> {
  constructor(
    protected readonly _isReadonly = false,
    protected readonly _isShallow = false
  ) {}

  get(target: Target, key: string | symbol, receiver: any) {
    const isReadonly = this._isReadonly,
      isShallow = this._isShallow;
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow;
    } else if (key === ReactiveFlags.RAW) {
      if (
        receiver === (isReadonly ? readonlyMap : reactiveMap).get(target) ||
        Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)
      ) {
        return target;
      }
      return;
    }
    const res = Reflect.get(target, key, receiver);
    if (!isReadonly) {
      // 收集依赖
    }
    // 浅层直接返回
    if (isShallow) {
      return res;
    }
    // 深层 res是对象继续递归 懒汉模式提升性能
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res); 
    }
    return res;
  }
}

class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow = false) {
    super(false, isShallow);
  }

  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    let oldValue = (target as any)[key];
    const result = Reflect.set(target, key, value, receiver);
    // 触发更新
    if (oldValue !== value) {
    }
    return result;
  }
}

class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow = false) {
    super(false, isShallow);
  }

  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    console.log(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target,
    );
    return true;
  }
}

export const mutableHandlers: ProxyHandler<object> =
  new MutableReactiveHandler();

export const readonlyHandlers: ProxyHandler<object> =
  new ReadonlyReactiveHandler();

export const shallowReactiveHandlers = new MutableReactiveHandler(true);

export const shallowReadonlyHandlers = new ReadonlyReactiveHandler(true);
