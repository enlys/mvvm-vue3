// 事件
// div @click="onClick"  div @click="onClick1
// 时间不能覆盖
// 原生的绑定事件 addEventListener 移除事件 removeEventListener 

export const patchEvent = (el, eventName, nextValue) => {
  // 对函数缓存
  const invokers = el._vei || (el._vei = {});
  const exits = invokers[eventName];
  if (exits && nextValue) {
    exits.value = nextValue;
  } else {
    // 获取事件类型
    const eventNameLow = eventName.slice(2).toLowerCase();
    // 获取事件处理函数并缓存
    if (nextValue) {
      const event = (invokers[eventNameLow] = createInvoker(nextValue));
      el.addEventListener(eventNameLow, event);
    } else {
      el.removeEventListener(eventNameLow, exits);
      invokers[eventNameLow] = undefined;
    }

  }
}

function createInvoker(fn) {
  const invoker = (e) => invoker.value(e);
  invoker.value = fn;
  return invoker;
}