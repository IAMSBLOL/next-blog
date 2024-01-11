## useState 和 this.setState 对比记录

### 概述

从源码分析两个更新方式的差异。因为今天又忽然忘记了useState在哪里处理hook.queue，还得从新走一遍源码。还是写个文档记录下来吧。这两个更新的逻辑是完全不一样的。


---


### 初始化updateQueue

useState初始化updateuqeue：**mountWorkInProgressHook。**

```typescript
function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  console.log(workInProgressHook)
  console.log(currentlyRenderingFiber$1,'currentlyRenderingFiber$1')
  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}
```
this.setState初始化updateuqeue： **initializeUpdateQueue**，在挂载**cls组件**对fiber做了这个操作。
baseState 当前的state值firstBaseUpdate 更新队列的头指针lastBaseUpdate 更新队列的尾指针shared.pending 更新队列   lanes优先级 interleaved 渲染中产生的setState，可能是用户点击或者其他effects this.setState回调等的存放 在commitUpdateQueue执行。

```typescript
function initializeUpdateQueue(fiber) {
  var queue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null,
      interleaved: null,
      lanes: NoLanes
    },
    effects: null
  };
  fiber.updateQueue = queue;
}
```
**总结：**
可以看出类组件和函数组件的updateQueue结构是不一样的。类组件的memoizedState存放的是state值，而函数组件还套了一层hook，memoizedState.hook。

### 触发

**this.setState ：**

classComponentUpdater里边触发更新方式的一种。在adoptClassInstance函数中给当前实例绑定classComponentUpdater。

enqueueSetState : createUpdate、enqueueUpdate。update队列结构（如下）。

```typescript
  var update = {
    eventTime: eventTime,
    lane: lane,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null
  };
```
enqueueSetState每次触发都会往updateQueue.shared队列塞进去一个update。即使value一样，也是会触发。
**useState：**

**挂载：**mountState、updateState**(这个比较隐藏、在renderHooks，并且Component（）才会触发)**。update队列结构。 queue.pending | |queue.interleaved 为update。

```typescript
  var queue = {
    pending: null,
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };

  var update = {
    lane: lane,
    action: action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };
```
dispatchSetState：
enqueueRenderPhaseUpdate enqueueUpdate$1。

1. **对比：**

**队列结构不一样。不过updatequeue是一样的，都是环形链。（后边处理的时候根据最后一个是不是第一个来判定推出循环）。同样在enqueueUpdate做了这个操作，然后开始更新。**

**但是更新之前也有区别，useState有优化策略，如果你上次的value和下一次的一样，会触发eagerState策略，不会走到更新。**

**this.setState则不会处理，会走到scheduleUpdateOnFiber。这也是他们在触发时最大的不同。**


---


### 更新

**this.setState更新**

在**processUpdateQueue**中处理。先判断pendingQueue是否为空，不为空就把环型链断开。代码片段：

```typescript
  // 上次还没搞完的队列的的头指针
  var firstBaseUpdate = queue.firstBaseUpdate;
  // 队列的尾指针
  var lastBaseUpdate = queue.lastBaseUpdate; // Check if there are pending updates. If so, transfer them to the base queue.
  // 当前更新队列
  var pendingQueue = queue.shared.pending;
 
  if (pendingQueue !== null) {
    // 当前队列为空
    queue.shared.pending = null; // The pending queue is circular. Disconnect the pointer between first
    // and last so that it's non-circular.
    // 新队列
    var lastPendingUpdate = pendingQueue;
    // 第一个更新指针指向为第一个setstate的更新，因为最后一个更新的next指向第一个更新
    var firstPendingUpdate = lastPendingUpdate.next;
    // 然后把最后一个指针指向清空
    lastPendingUpdate.next = null; // Append pending updates to base queue

    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate;
    } else {
       // lastBaseUpdate，把刚刚队列挂进来，
      lastBaseUpdate.next = firstPendingUpdate;
    }
    
```
其中lastPendingUpdate.next = null这操作是后边代码中断循环的条件。
**processUpdateQueue还收集了this.setState的callback。执行时机见另外一篇文章。**

里边有个函数：getStateFromUpdate，是合并当前的state值的操作，就不分析了。

**useState更新：**

useState更新比较鸡贼，在renderWithHooks的时候触发了useState更新，执行的是updateState，其实和useRedeucer的实现原理是一样的。所以更新主要在**updateReducer**里边执行。操作大同小异。懒得赘述了。

*环型链看起就很搞心态，console也打印不出来。*


---


### 总结

更新队列的数据属性和存放不同 ，但是都是环星链。优化策略不同，hooks可以在触发就拒绝更新，cls组件需要checkshouldDupdate更新原理不同，一个processUpdateQueue，一个updateReducer。但是都是解环、遍历。至于为啥不统一数据属性，了能时兼容老版本吧。

补充：setState异步结果原因主要因为ensureRootIsScheduled里边的优化。毕竟没更新组件之前，也就是没执行上边两个更新主要函数时，拿到的是上一次的值是很正常不过的事情。均在begeinWork中执行。

最后，本质上貌似没啥区别。把每次action存进队列，某个阶段遍历链，拿到最终值，如果有高优先级或许会被中断，this.setState用firstBaseUpdate 、lastBaseUpdate来接上上次没更新的。useStateze用currentHook.baseQueue来接上上次没更新的。

