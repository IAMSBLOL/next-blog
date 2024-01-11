# useTransition、useDeferredValue 源码分析
react 18 更新了。添加了几个hooks，不过需要使用concurentMode模式才能愉快使用。不然的话走的还是同步更新，没有lane和调度概念。

react 越来越不像一个框架，反而像react os。一个基于react思路的微型操作系统。useTransition、useDeferredValue 要实现的比较像防抖节流的功能，但是实现原理倒是不一样的。

最大的区别就是多了个lane 调度吧。

### useTransition

```typescript

function mountTransition() {
  var _mountState2 = mountState(false),
      isPending = _mountState2[0],
      setPending = _mountState2[1]; // The `start` method never changes.



  var start = startTransition.bind(null, setPending);
  var hook = mountWorkInProgressHook();
  hook.memoizedState = start;
  return [isPending, start];
}

```
没想到吧，**核心还是useState。**
**简单来讲就是用优先级更高的task去挤掉当前的**callback。

```typescript
function startTransition(setPending, callback) {
  var previousPriority = getCurrentUpdatePriority();

  setCurrentUpdatePriority(higherEventPriority(previousPriority, ContinuousEventPriority));
  setPending(true);

  var prevTransition = ReactCurrentBatchConfig$2.transition;
  ReactCurrentBatchConfig$2.transition = 1;

  try {
    setPending(false);
    callback();
  } finally {
    setCurrentUpdatePriority(previousPriority);
    ReactCurrentBatchConfig$2.transition = prevTransition;

    {
      if (prevTransition !== 1 && warnOnSubscriptionInsideStartTransition && ReactCurrentBatchConfig$2._updatedFibers) {
        var updatedFibersCount = ReactCurrentBatchConfig$2._updatedFibers.size;

        if (updatedFibersCount > 10) {
          warn('Detected a large number of updates inside startTransition. ' + 'If this is due to a subscription please re-write it to use React provided hooks. ' + 'Otherwise concurrent mode guarantees are off the table.');
        }

        ReactCurrentBatchConfig$2._updatedFibers.clear();
      }
    }
  }
}
```
setPending（true）之后，后边的任务是带着transiton的。
```typescript
var prevTransition = ReactCurrentBatchConfig$2.transition;   ReactCurrentBatchConfig$2.transition =1;
```
这句就是核心代码。
其实也没什么黑科技，就是后边setPending(false);callback();，在触发dispatchSetState的时候，requestUpdateLane返回的是isTransition任务。优先级下降。

所以后边两个任务在调度的时候会在下一次没有更高优先级的情况下才会执行。

不过由于shceduler的特性，这个Transition任务随着时间（最多50ms），优先级会越来越高。如果超过过期时间就会优先级最高。

这就是useTransition的原理。确实感人。


---


### useDeferredValue 

useDeferredValue 背后的逻辑就更感人了。

```typescript
function mountDeferredValue(value) {
  var _mountState = mountState(value),
      prevValue = _mountState[0],
      setValue = _mountState[1];

  mountEffect(function () {
    var prevTransition = ReactCurrentBatchConfig$2.transition;
    ReactCurrentBatchConfig$2.transition = 1;

    try {
      setValue(value);
    } finally {
      ReactCurrentBatchConfig$2.transition = prevTransition;
    }
  }, [value]);
  return prevValue;
}
```
没想到吧，用的是 useTransition+ useEffect的思路。
核心还是这一句：

var prevTransition = ReactCurrentBatchConfig$2.transition;     ReactCurrentBatchConfig$2.transition =1;

如果要自己模拟的话，思路是这样。

```typescript
function useCustomHooks(value){
  const [deferredValue, setDeferredValue] = useState(value)
  useEffect(()=>{
     try  {
       requestIdleCallback(() => setDeferredValue(value))
     } finally {

     }
  }, [value])
  return deferredValue
}
```
总的来讲，在concurrentMode模式下，自己用其他方法也是可以实现类似功能hooks的。不过不一样的是，react有自己**调度的优先级**。
