import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";
// 属性
// 策略模式 old class="box" style= {color: "red"} new class="box box2"  style= {color: "red", background: "blue"}
export const patchProp = (
  el: HTMLElement,
  key: string,
  prevValue,
  nextValue
) => {
  switch (key) {
    case "class":
      patchClass(el, nextValue);
      break;
    case "style":
      patchStyle(el, prevValue, nextValue);
      break;
    default:
      // 是否是事件 on开头 @click
      if (/^on[^a-z]/.test(key)) {
        patchEvent(el, key, nextValue);
      } else {
        patchAttr(el, key, nextValue);
      }
      break;
  }
};
