## 摘要

分析VUE3 组合式API实现原理、API的差异、执行阶段，结合实际应用场景思考，提高hooks的了解，提高搬砖容错率与效率。

首先需要会调试vue3源码，过程很简单。

[vue3 源码调试](https://shimo.im/docs/m5kvdE9BDRs8Qr3X)


## VUE依赖收集、更新机制简介

只看核心部分，说明代码流程。基本都会涉及到trackRefValue（收集） **、**triggerRefValue（触发）。

ReactiveEffect2 是最最最核心部分。


注意看代码注释

#### 依赖收集

#### **trackRefValue 入口函数**

```javascript
  // packages/reactivity/src/ref.ts
  function trackRefValue(ref2) {
    // 重点在于 activeEffect 和 trackEffects 函数
    if (shouldTrack && activeEffect) {
      ref2 = toRaw(ref2);
      if (true) {
        trackEffects(ref2.dep || (ref2.dep = createDep()), {
          target: ref2,
          type: "get" /* GET */,
          key: "value"
        });
      } else {
        trackEffects(ref2.dep || (ref2.dep = createDep()));
      }
    }
  }

```
#### trackEffects

这一块代码量并不多

```javascript
  // 收集依赖
  function trackEffects(dep, debuggerEventExtraInfo) {
    let shouldTrack2 = false;
    // 最大栈限制
    if (effectTrackDepth <= maxMarkerBits) {
      if (!newTracked(dep)) {
        dep.n |= trackOpBit;
        shouldTrack2 = !wasTracked(dep);
      }
    } else {
      shouldTrack2 = !dep.has(activeEffect);
    }
    // 判断
    if (shouldTrack2) {
      // 添加进dep 依赖收集
      dep.add(activeEffect);
      // 双向
      activeEffect.deps.push(dep);
      // onTrack 参数，调试使用
      if (activeEffect.onTrack) {
        activeEffect.onTrack(
          extend(
            {
              effect: activeEffect
            },
            debuggerEventExtraInfo
          )
        );
      }
    }
  }
```

#### 
#### 更新机制

#### triggerEffects 

```javascript
  function triggerEffects(dep, debuggerEventExtraInfo) {
    // 如果不是迭代器就转迭代器
    const effects = isArray(dep) ? dep : [...dep];
    console.log(effects,'effects')
    // 如果是计算属性
    // 思考：为何计算属性先执行
    // 个人理解是：？？？

    for (const effect2 of effects) {
      if (effect2.computed) {
        console.log(effect2,'计算属性')
        triggerEffect(effect2, debuggerEventExtraInfo);
      }
    }
    // 如果是非计算属性
    for (const effect2 of effects) {
      if (!effect2.computed) {
        console.log(effect2,'非计算属性')
        triggerEffect(effect2, debuggerEventExtraInfo);
      }
    }
  }
```
#### triggerEffect

```javascript
  function triggerEffect(effect2, debuggerEventExtraInfo) {
    if (effect2 !== activeEffect || effect2.allowRecurse) {
      if (effect2.onTrigger) {
        effect2.onTrigger(extend({ effect: effect2 }, debuggerEventExtraInfo));
      }
      if (effect2.scheduler) {
        // 调度函数
        effect2.scheduler();
      } else {
        // 执行函数
        effect2.run();
      }
    }
  }
```

#### ReactiveEffect2 

最核心的类，watch、computed、组件更新都基于此。activeEffect 也在run 函数中赋值。

以上的依赖收集、依赖触发更新都是基于这个类去实现。把这一块看明白基本就明白vue3的更新原理。

这个类分别在：

1. 组件引用到响应式值时（更新组件），这个最重要。基本就是vue的实现思路了。
2. watch 
3. computed
4. effect （这个不在开放API里边，忽略）
后边API分析会说明具体情况，在这里先不赘述。

这里主要是fn（getter），scheduler （副作用函数），如果不存在scheduler ，则执行run。

```javascript
var ReactiveEffect2 = class {
    constructor(fn, scheduler = null, scope) {
      // getter
      this.fn = fn;
      // 副作用函数
      this.scheduler = scheduler;
      this.active = true;
      // 依赖
      this.deps = [];
      this.parent = void 0;
      recordEffectScope(this, scope);
    }
    run() {
      // 组件加载时会执行
      console.log('17068')
      if (!this.active) {
        return this.fn();
      }
      let parent = activeEffect;
      let lastShouldTrack = shouldTrack;
      while (parent) {
        if (parent === this) {
          return;
        }
        parent = parent.parent;
      }
      try {
        this.parent = activeEffect;
        activeEffect = this;
        shouldTrack = true;
        trackOpBit = 1 << ++effectTrackDepth;
        if (effectTrackDepth <= maxMarkerBits) {
          initDepMarkers(this);
        } else {
          cleanupEffect(this);
        }
        return this.fn();
      } finally {
        if (effectTrackDepth <= maxMarkerBits) {
          finalizeDepMarkers(this);
        }
        trackOpBit = 1 << --effectTrackDepth;
        activeEffect = this.parent;
        shouldTrack = lastShouldTrack;
        this.parent = void 0;
        if (this.deferStop) {
          this.stop();
        }
      }
    }
    stop() {
      if (activeEffect === this) {
        this.deferStop = true;
      } else if (this.active) {
        cleanupEffect(this);
        if (this.onStop) {
          this.onStop();
        }
        this.active = false;
      }
    }
  };
```

### 
## API分析

API实现原理大同小异，比较复杂的时是setup组件更新这一块，ref和其他逻辑类似。

### setup

这一块基本代码包含整个vue的实现思路。相关函数如下，执行顺序按排序。

1. baseCreateRenderer
    1. render2
        1. patch
        2. flushPreFlushCbs 组件更新前的pre 队列 ，本质上和sync一致，但时机不同
        3.  flushPostFlushCbs 组件更新后 异步 promise
2. processComponent
3. mountComponent
    1. 首次加载会执行改函数
4. createComponentInstance
    1. 创建实例
5. setupComponent
    1. 初始化slot（initSlots）
    2. props（initProps）
    3. state（setupStatefulComponent）
        1. handleSetupResult 初始化模板依赖
```javascript
  function handleSetupResult(instance, setupResult, isSSR) {
    // jsx 或者 tsx
    if (isFunction(setupResult)) {
      if (false) {
        instance.ssrRender = setupResult;
      } else {
        instance.render = setupResult;
      }
      // vue setup
    } else if (isObject(setupResult)) {
      if (isVNode(setupResult)) {
        warn2(
          `setup() should not return VNodes directly - return a render function instead.`
        );
      }
      if (true) {
        instance.devtoolsRawSetupState = setupResult;
      }
      // proxy 代理
      instance.setupState = proxyRefs(setupResult);
      if (true) {
        exposeSetupStateOnRenderContext(instance);
      }
    } else if (setupResult !== void 0) {
      warn2(
        `setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`
      );
    }
    finishComponentSetup(instance, isSSR);
  }
```
6. applyOptions 注册生命周期等
7. setupRenderEffect ，setup之后的副作用函数
    1. componentUpdateFn
        1. 最最最核心的函数
        2. 代码太长，贴一部分
```javascript
      // init 响应式类
      const effect2 = instance.effect = new ReactiveEffect2(
        // getter 也是 run的函数
        componentUpdateFn,
        // 异步队列
        () => queueJob(update),
        instance.scope
        // track it in component's effect scope
      );

      // componentUpdateFn 实际执行这个，初次挂载
      const update = instance.update = () => effect2.run();
      update.id = instance.uid;
      toggleRecurse(instance, true);
      if (true) {
        effect2.onTrack = instance.rtc ? (e) => invokeArrayFns(instance.rtc, e) : void 0;
        effect2.onTrigger = instance.rtg ? (e) => invokeArrayFns(instance.rtg, e) : void 0;
        update.ownerInstance = instance;
      }
      // const update = instance.update = () => effect2.run(); === componentUpdateFn
      update();
```

简单总结：setup init state，组件get使用时绑定依赖关系。初始化执行componentUpdateFn

后，设置activeEffect，绑定setupstate关系。依赖更新时触发componentUpdateFn，patch。从而更新组件，刷新事件队列，执行hooks。

#### ref

被使用时绑定activeEffect，更新触发副作用函数执行

```javascript
  var RefImpl = class {
    constructor(value, __v_isShallow) {
      this.__v_isShallow = __v_isShallow;
      this.dep = void 0;
      this.__v_isRef = true;
      this._rawValue = __v_isShallow ? value : toRaw(value);
      this._value = __v_isShallow ? value : toReactive(value);
    }
    get value() {
      // get 收集依赖入口
      trackRefValue(this);
      return this._value;
    }
    set value(newVal) {
      const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
      newVal = useDirectValue ? newVal : toRaw(newVal);
      // 优化：判断是否值改变
      if (hasChanged(newVal, this._rawValue)) {
        this._rawValue = newVal;
        this._value = useDirectValue ? newVal : toReactive(newVal);
        // set 触发依赖入口 
        triggerRefValue(this, newVal);
      }
    }
  };
```

#### computed

和ref不同的时，它自己再绑定了一个ReactiveEffect2。针对reactive的state，只是多了一层依赖。

```javascript
 
  var ComputedRefImpl = class {
    constructor(getter, _setter, isReadonly2, isSSR) {
      this._setter = _setter;
      this.dep = void 0;
      this.__v_isRef = true;
      this[_a] = false;
      this._dirty = true;
      // 通过getter绑定ReactiveEffect2
      this.effect = new ReactiveEffect2(getter, () => {
        if (!this._dirty) {
          this._dirty = true;
          // 触发依赖更新
          triggerRefValue(this);
        }
      });
      //执行副作用时遍历不同的判断
      this.effect.computed = this;
      this.effect.active = this._cacheable = !isSSR;
      this["__v_isReadonly" /* IS_READONLY */] = isReadonly2;
    }
    get value() {
      const self2 = toRaw(this);
      trackRefValue(self2);
      // getter 更新_dirty
      if (self2._dirty || !self2._cacheable) {
        self2._dirty = false;
        // 执行triggerRefValue
        self2._value = self2.effect.run();
      }
      return self2._value;
    }
    set value(newValue) {
      // 可以自定义，也可以只读
      this._setter(newValue);
    }
  };
```

#### watch

主要逻辑doWatch函数。 

主要做了：

1. 不同的getter 差异化处理，需要注意的是，如果为reactive对象，则添加deep标签。
2. 如果存在immediate，则先同步执行job
3. 回调函数执行队列
    1. pre 默认为pre watchEffect是该队列的实现
    2. sync watchSyncEffect 是该队列的
    3. post watchPostEffect是该队列的实现
4. 绑定ReactiveEffect2
    1. getter 为传入值
    2. setter为回调函数
```javascript
    const effect2 = new ReactiveEffect2(getter, scheduler);
```

原理和计算属性一致，ReactiveEffect2是万能的。

在开发业务时，需要思考清楚哪些effect需要执行的时机。post队列作用其实和nextTick也类似。个人觉得如果需要很精确的控制vue的队列调度，心智负担是比react重的。它类似是react reconciler的简化版，post队列也有优先级。而调度与性能关系不大，只是提高用户体验和合理使用客户端硬件资源。

#### EffectScope

这个API在实际场景应用上其实和react的useContext类似。局部的状态共享。参考vueuse的createSharedComposable和createGlobalState。

通过ReactiveEffects 构造函数中的 recordEffectScope 绑定组件实例的scope。

```javascript
  function recordEffectScope(effect2, scope = activeEffectScope) {
    if (scope && scope.active) {
      scope.effects.push(effect2);
    }
  }
  // 是否与父级关联 detached
  function effectScope(detached) {
    return new EffectScope(detached);
  }
```
