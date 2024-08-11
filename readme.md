## 模拟vue3简易版本

## 完成模块

代码命名会保持和源码中的一致。

### 实现模块

#### runtime-core

运行时核心 

- 支持组件类型
- 支持 element 类型
- 初始化 props
- setup 可获取 props 和 context
- 支持 proxy
- 可以在 render 函数中获取 setup 返回的对象
- 支持 getCurrentInstance

#### reactivity

响应式核心

-  reactive 的实现
-  ref 的实现
-  readonly 的实现
-  computed 的实现
-  track 依赖收集
-  trigger 触发依赖
-  支持嵌套 reactive
-  支持 isReadonly
-  支持 shallowReadonly

### runtime-dom
- custom renderer 
