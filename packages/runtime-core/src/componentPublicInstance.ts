import { hasOwn } from "@vue/shared";

export const componentPublicInstance = {
  // { _: instance } 
  get({ _: instance }, key) {
    // $开头的属性不能被访问
    if (key[0] === "$") {
      return;
    }
    const { setupState, props, data } = instance;
    if (hasOwn(props, key)) {
      return props[key];
    }
    if (hasOwn(setupState, key)) {
      return setupState[key];
    }
    return data[key];
  },
  set({ _: instance }, key, value) {
    const { setupState, props, data } = instance;
    if (hasOwn(props, key)) {
      return props[key] = value;
    }
    if (hasOwn(setupState, key)) {
      return setupState[key] = value;
    }
    return data[key] = value;
  } 
}