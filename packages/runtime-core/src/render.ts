import { ShapeFlags } from "@vue/shared";
import { apiCreateApp } from "./apiCreateApp";
import { setupComponent, createComponentInstance } from "./component";
import { effect } from "packages/reactivity/src/effect";
import { CVnode, TEXT } from "./vnode";
import { invokeArrayFns } from "./apiLifecycle";

// runtime-core 方法
export function createRender(rendererOptionDom) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
  } = rendererOptionDom;

  function setupRenderEffect(instance, container) {
    
    const instanceEffect = (instance.effect = effect(function componentEffect() {
      if (!instance.isMounted) {

        // 渲染之前
        let { bm, m } = instance;
        if (bm) {
          invokeArrayFns(bm);
        }
        // 挂载组件
        let proxy = instance.proxy;
        const subTree = (instance.subTree = instance.render.call(proxy, proxy));
        // 渲染dom
        patch(null, subTree, container);
        // 渲染完成
        if (m) {
          invokeArrayFns(m);
        }
        instance.isMounted = true;
      } else {
        // 更新组件
        // 比对
        let { next, bu, u } = instance;
        if (bu) {
          invokeArrayFns(bu);
        }
        const proxy = instance.proxy;
        const prevTree = instance.subTree;
        const nextTree = instance.render.call(proxy, proxy);
        instance.subTree = nextTree;
        patch(prevTree, nextTree, container);
        if (u) {
          invokeArrayFns(u);
        }
      }
    }));
    instance.update = () => {
      instanceEffect.run();
    };
  }
  // 更新组件
  const updateComponent = (n1, n2) => {
    const instance = (n2.component = n1.component);
    instance.next = n2;
    instance.update();
  };
  // 挂载组件
  const mountComponent = (initialVnode, container) => {
    // 1.创建组件实例对象
    const instance = (initialVnode.component =
      createComponentInstance(initialVnode));
    // 2.解析数据到实例上
    setupComponent(instance);
    // 3.创建effect让render执行 渲染
    setupRenderEffect(instance, container);
  };
  // 创建组件
  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      // 首次渲染
      mountComponent(n2, container);
    } else {
      // 更新
      updateComponent(n1, n2);
    }
  };
  // 挂载子元素
  const mountChildren = (el, children) => {
    for (let i = 0; i < children.length; i++) {
      let child = CVnode(children[i]);
      patch(null, child, el);
    }
  };
  // 挂载元素
  const mountElement = (vnode, container, anchor) => {
    // 递归 h('div', {}, [h('div', {})])
    const { type, props, children, shapeFlag } = vnode;
    // 获取到真实元素
    let el = (vnode.el = hostCreateElement(type));
    // 处理属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 处理子元素
    if (children) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(el, children);
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 遍历子元素
        mountChildren(el, children);
      }
    }
    // 插入指定位置
    hostInsert(el, container, anchor);
  };
  // 比对属性
  const patchProps = (el, oldProps, newProps) => {
    if (oldProps === newProps) return;
    for (let key in newProps) {
      let oldValue = oldProps[key];
      let newValue = newProps[key];
      if (oldValue !== newValue) {
        hostPatchProp(el, key, oldValue, newValue);
      }
    }
    for (let key in oldProps) {
      if (!newProps[key]) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };
  // 卸载子元素
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      hostRemove(child.el);
    }
  };
  // 比对子节点数组
  const patchKeyedChildren = (c1, c2, el) => {
    // vue2: 双指针
    // vue3 同步比较一比一 先头部比较再尾部比较
    
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // sync from start: 头部比较  同一位置比对元素不同就停止  那个数组没有停止
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }
    // sync from end: 尾部比较
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 3.新节点有剩余  旧节点没有剩余
    if (i > e1) {
      // 添加数据
      // 前面追加
      const nextPros = e2 + 1;
      const anchor =  nextPros < c2.length ? c2[nextPros].el : null;
      while (i <= e2) {
        patch(null, c2[i++], el, anchor);
      }
    } else if (i > e2) { // 旧节点有剩余 新节点没有剩余  
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      // 乱序
      // 以新的乱序创建映射表 在用旧的乱序数据区新表找
      // 找到就复用 没有删除
      let s1 = i;
      let s2 = i;
      // 乱序问题 1：位置 2：新值没有
      const toBePatched = e2 - s2 + 1;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

      // 创建表
      let keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        if (nextChild.key) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        let newIndex = keyToNewIndexMap.get(prevChild.key);
        if (newIndex === undefined) {
          // 删除
          unmount(prevChild);
        } else {
          // 找到就复用
          // 新节点在老节点的索引位置+1
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], el);
          // 1 新添加的数据没有  复用的数据位置不对
        }
      }
      //移动节点 
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
      let j = increasingNewIndexSequence.length;
      for (let i = toBePatched -1; i >= 0; i--) {
        let currentIndex = i + s2; // 新增元素索引
        // 添加位置
        const anchor = currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) { // 追加的新数据
          patch(null, c2[currentIndex], el, anchor);
        } else {
          // 这种方式不好，每次每个都插入性能差
          // hostInsert(c2[currentIndex].el, el, anchor);

          // 最长递增子序列
          // [5,3,4,0] => [3,4] 找到3和4位置就不动了 把其余位置插入到此序列的前面或后面或中间（插入过程中用到二分查找）
          if (i !== increasingNewIndexSequence[j - 1]) { // 不在递增序列中 移动
            hostInsert(c2[currentIndex].el, el, anchor);
          } else { // 不动
            j--;
          }
        }

      }
    }
  };
  // 比对子节点
  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const preShapeFlag = c1.shapeFlag;
    const newShapeFlag = n2.shapeFlag;
    // 1.子节点都是文本
    // 2.新节点没有子节点旧的有
    // 3.新节点有子节点旧没有
    // 4.子节点都是数组
    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 都是数组子节点
        patchKeyedChildren(c1, c2, el);
       
      } else { // 老的子节点不是数组 新的子节点是数组
        // 旧的文本删除
        hostSetElementText(el, "");
        mountChildren(el, c2);
      }
    }
  };
  // 更新元素
  const patchElement = (n1, n2, container, anchor) => {
    // 属性
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
    // 比对子节点
    patchChildren(n1, n2, el);
  };
  // 创建元素
  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      // 首次渲染
      // 创建元素
      mountElement(n2, container, anchor);
    } else {
      // 更新
      // 处理属性
      patchElement(n1, n2, container, anchor);
    }
  };

  // 处理文本
  function processText(n1, n2, container) {
    if (n1 == null) {
      // 首次渲染
      // 创建文本
      hostInsert((n2.el = hostCreateText(n2.children)), container);
    }
  }
  const isSameVnode = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  };

  const unmount = (vnode) => {
    hostRemove(vnode.el);
  };

  const patch = (n1, n2, container, anchor = null) => {
    // 比对
    // 1 是否是同一元素
    if (n1 && !isSameVnode(n1, n2)) {
      // 卸载
      unmount(n1);
      n1 = null;
    }
    let { shapeFlag, type } = n2;
    switch (type) {
      case TEXT:
        // 文本
        processText(n1, n2, container);
    }
    if (shapeFlag & ShapeFlags.ELEMENT) {
      // 元素
      // 处理元素
      processElement(n1, n2, container, anchor);
    } else if (shapeFlag & ShapeFlags.COMPONENT) {
      // 组件
      processComponent(n1, n2, container);
    }
  };

  let render = (vnode, container) => {
    // 渲染逻辑
    // 组件初始化 判断是否首次渲染 第一次直接生成
    // diff 算法
    // 首次渲染
    patch(null, vnode, container);
  };
  return {
    createApp: apiCreateApp(render),
  };
}

function getSequence(arr: number[]) {
  // 递增
  let len = arr.length;
  let result = [0];
  let start = 0;
  let end = 0;
  let middle = 0;
  let p = arr.slice(0);
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    // 排除0
    if (arrI !== 0) {
      let resultLastIndex = result[result.length - 1]; // 最后一个元素
      if (arr[resultLastIndex] < arrI) {
        p[i] = resultLastIndex; // 记录前面一个元素
        result.push(i);
        continue;
      }
      // 二分查找 [1,8,5,3,4,9,7,6]  1+6 / 2 = 3
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = (start + end) / 2 | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      // 找到对应位置
      if(arrI < arr[result[start]]) {
        // 替换
        if (start > 0) {
          p[i] = result[start - 1];
        }
        result[start] = i;
      } 
    }
  }
  // 循环获取数据 驱节点向前移动
  let len1 = result.length; // 总长度
  let last = result[len1 - 1]; // 获取最后一个
  while (len1-- > 0) {
    result[len1] = last;
    last = p[last];
  }
  return result;
}
