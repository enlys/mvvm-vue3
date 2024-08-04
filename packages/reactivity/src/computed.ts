import { isFunction } from "@vue/shared";
import { effect } from "./effect";

export function computed(getterOrOptions) {
  // 可能是函数或者对象
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn('computed value must be readonly');
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
  public _dirty = true; // 默认执行一次getter
  public _value;
  public effect;
  constructor(private getter, private setter) {
    // 创建effect进行依赖收集
     this.effect = effect(
      () => getter(), 
      {
        lazy: true,
        scheduler: () => {
          if (!this._dirty) {
            this._dirty = true;
          }
        },
     }
    );
  }

  get value() {
    if(this._dirty) {
      this._value = this.effect(); // 获取用户值
      this._dirty = false;
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue)
  }
}