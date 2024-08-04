import { hasChanged, isArray } from "@vue/shared";
import { TrackOpTypes, TriggerOpTypes } from "./constants";
import { track, trigger } from "./effect";
import { toReactive } from "./reactive";

export function ref(target) {
  return createRef(target, false);
}

function createRef(rawValue, shallow) {
  return new RefImpl(rawValue, shallow);
}


class RefImpl {
  public __v_isRef = true;
  public _value: any;
  public _rawValue: any;
  constructor(value, public shallow: boolean = false) {
    this._rawValue = shallow ? value : value;
    this._value = shallow ? value : toReactive(value);
  }

  // 属性访问器
  get value() {
    track(this, TrackOpTypes.GET, "value");
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._value = newValue;
      this._rawValue = newValue;
      trigger(this, TriggerOpTypes.SET, "value", newValue);
    }
  }
}


export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

class ObjectRefImpl {
  public __v_isRef = true;
  constructor(public target, public key) {

  }

  get value() {
    return this.target[this.key];
  }
  set value(newValue) {
    this.target[this.key] = newValue;
  }  
}

export function toRefs(target) {
  const  ref = isArray(target) ? new Array(target.length) : {};
  for(let key in target) {
    ref[key] = toRef(target, key);
  }
  return ref;
}