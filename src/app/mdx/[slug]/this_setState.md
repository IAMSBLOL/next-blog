# this.setState 为什么需要回调
为什么this.setState提供两个参数，useState返回的dispatch只提供一个参数？

这可把我给问住了，虽然大概知道这个和getSnapshotBeforeUpdate或者useLayoutEffect功能是差不多的，但是心理也没底。重点是：为什么。

首先理一下思路：

在触发更新的时候，如果存在callback就在当前的update节点上挂上，然后开始scheduleUpdateOnFiber。

```typescript
   if (callback !== undefined && callback !== null) {
      {
        warnOnInvalidCallback(callback, 'setState');
      }
   
      update.callback = callback;
    }
    // 这个不用鸟，闭环链。
    enqueueUpdate(fiber, update);
    var root = scheduleUpdateOnFiber(fiber, lane, eventTime);
```
然后就直接到commitUpdateQueue，在commitlayout阶段执行，且只有在class组件的时候才会执行。
```typescript
function commitUpdateQueue(finishedWork, finishedQueue, instance) {
  // Commit the effects
  var effects = finishedQueue.effects;
  finishedQueue.effects = null;

  if (effects !== null) {
    for (var i = 0; i < effects.length; i++) {
      var effect = effects[i];
      var callback = effect.callback;

      if (callback !== null) {
        effect.callback = null;
        callCallback(callback, instance);
      }
    }
  }
}
```
callCallback
```typescript

function callCallback(callback, context) {
  if (typeof callback !== 'function') {
    throw new Error('Invalid argument passed as callback. Expected a function. Instead ' + ("received: " + callback));
  }

  callback.call(context);
}
```
好像没做什么特殊的操作，纯粹是commit之后拿到**最终值**。因为update可能存在多个，并且是异步执行，当前this.state并非最新。所以做了这个参数，以便于执行完setstate可以做些事情。但是……不需要也是可以的吧？
**嗯，最终解释就是给开发者更友好的API。**


---


**所以dispatchSetState为什么不需要这个操作？**

```typescript
function mountState(initialState) {
  var hook = mountWorkInProgressHook();

  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }

  hook.memoizedState = hook.baseState = initialState;
  var queue = {
    pending: null,
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  hook.queue = queue;
  var dispatch = queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber$1, queue);
  return [hook.memoizedState, dispatch];
}

function updateState(initialState) {
  return updateReducer(basicStateReducer);
}
```
关键代码就是这个updateReducer、basicStateReducer。实现原理和useReducer是一个样子的。
未完结，明天上班再写吧。离谱


