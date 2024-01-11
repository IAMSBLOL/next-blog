# React\scheduler.js

### 源码地址

结合分析看看会好很多，这里的代码会删了点，毕竟太多。

Scheduler源码地址​

github1s.com/facebook/react/blob/HEAD/packages/scheduler/src/forks/Scheduler.js#L440

### 大致执行流向

unstable_scheduleCallbackrequestHostTimeout || requestHostCallbackflushWorkworkLoopshouldYieldToHostperformWorkUntilDeadlineschedulePerformWorkUntilDeadline

### unstable_scheduleCallback

描述：处理timer队列或者task队列。判断优先级等。存在taskqueue和timerqueue，基本可以理解成taskqueue是从timer取值的，**advanceTimers**函数里边操作。

```plain
function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = getCurrentTime();

  var startTime;
  if (typeof options === 'object' && options !== null) {
    var delay = options.delay;
    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }

  var timeout;
  switch (priorityLevel) {
   // 任务优先度，不过最新的代码是用赛道（lane去决定），就是从一个变成一批的概念
  }

  var expirationTime = startTime + timeout;

  var newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };
  if (enableProfiling) {
    newTask.isQueued = false;
  }

  if (startTime > currentTime) {
    // This is a delayed task.
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // All tasks are delayed, and this is the task with the earliest delay.
      if (isHostTimeoutScheduled) {
        // Cancel an existing timeout.
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      // Schedule a timeout.
      // 或者延后任务，就是没这么重要的
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    if (enableProfiling) {
      markTaskStart(newTask, currentTime);
      newTask.isQueued = true;
    }
    // Schedule a host callback, if needed. If we're already performing work,
    // wait until the next time we yield.
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      // 从这个开始就对了
      requestHostCallback(flushWork);
    }
  }

  return newTask;
}
```

### requestHostTimeout

这个API重点在于**handleTimeout这个函数**

```plain
function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);
  // 是不是在跑着切片了，不是的话启动，是的话不用管，反正在跑着了
  if (!isHostCallbackScheduled) {
    // 任务队列存在，就开始跑起来
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      // 没有就去时间队列找，存在的话继续执行自己，没有就没了呗
      const firstTimer = peek(timerQueue);
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}
```

### requestHostCallback

requestIdleCallback的react实现

```plain
function requestHostCallback(callback) {
  // schedulePerformWorkUntilDeadline执行的callback
  scheduledHostCallback = callback;
  // 如果没开始跑就启动，如果已经在跑就不管鸟，加入队列就会自己跑
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

```



### flushWork

flushWork是requestHostCallback的参数（即回调）= scheduledHostCallback

```plain
// 参数是是否剩余时间，上一帧的时间
function flushWork(hasTimeRemaining, initialTime) {
  if (enableProfiling) {
    markSchedulerUnsuspended(initialTime);
  }

  // We'll need a host callback the next time work is scheduled.
  isHostCallbackScheduled = false;
  // 是不是在timeout，是的话就取消
  if (isHostTimeoutScheduled) {
    // We scheduled a timeout but it's no longer needed. Cancel it.
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }
  // 开始工作
  isPerformingWork = true;
  const previousPriorityLevel = currentPriorityLevel;
  try {
    // 报错信息，开发环境用的把
    if (enableProfiling) {
      try {
        return workLoop(hasTimeRemaining, initialTime);
      } catch (error) {
        if (currentTask !== null) {
          const currentTime = getCurrentTime();
          markTaskErrored(currentTask, currentTime);
          currentTask.isQueued = false;
        }
        throw error;
      }
    } else {
      // No catch in prod code path.
      return workLoop(hasTimeRemaining, initialTime);
    }
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
    if (enableProfiling) {
      const currentTime = getCurrentTime();
      markSchedulerSuspended(currentTime);
    }
  }
}
```
### workLoop

就是调度的loop，返回值boolean。这里的返回值是**scheduledHostCallback的返回值。performWorkUntilDeadline**执行的判断条件。**performWorkUntilDeadline是在schedulePerformWorkUntilDeadline执行的callback。很绕是吧。对，所以就是个循环。loop。**

**反正只要还有任务就一直workloop，至于执行不执行**currentTask.callback，就看有没有时间。就是这么简单的逻辑，emmmm……很简单对吧

```plain
function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  // 这个是处理timerqueue和taskqueue的，从time拿任务到task
  advanceTimers(currentTime);
  // 拿出一个任务
  currentTask = peek(taskQueue);
  while (
    currentTask !== null &&
    !(enableSchedulerDebugging && isSchedulerPaused)
  ) {
    // 如果这个任务时间还没到，让出线程。
    // 如果没有时间也让出shouldYieldToHost
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || shouldYieldToHost())
    ) {
      // This currentTask hasn't expired, and we've reached the deadline.
      break;
    }
    // 任务的回调，可以不用管是啥
    const callback = currentTask.callback;
    // 如果回调是个函数就走执行的逻辑，不是直接扔掉
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      if (enableProfiling) {
        markTaskRun(currentTask, currentTime);
      }
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
        if (enableProfiling) {
          markTaskYield(currentTask, currentTime);
        }
      } else {
        if (enableProfiling) {
          markTaskCompleted(currentTask, currentTime);
          currentTask.isQueued = false;
        }
        if (currentTask === peek(taskQueue)) {
           // 删除已经执行的任务
          pop(taskQueue);
        }
      }
      // 重新从时间队列搞一个出来
      advanceTimers(currentTime);
    } else {
      // 扔掉
      pop(taskQueue);
    }
    // currentTask 等于队列下一个
    currentTask = peek(taskQueue);
  }
  // Return whether there's additional work
  // 如果还有任务就是true，继续
  if (currentTask !== null) {
    return true;
  } else {
    // 没有的话就去时间队列看看，有的话继续循环
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}

```
### shouldYieldToHost

```plain
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  // 当前帧花了多少时间，如果小于5ms说明还可以继续跑。所以一般任务估计也就是5ms+
  if (timeElapsed < frameInterval) {
    // The main thread has only been blocked for a really short amount of time;
    // smaller than a single frame. Don't yield yet.
    return false;
  }

  // The main thread has been blocked for a non-negligible amount of time. We
  // may want to yield control of the main thread, so the browser can perform
  // high priority tasks. The main ones are painting and user input. If there's
  // a pending paint or a pending input, then we should yield. But if there's
  // neither, then we can yield less often while remaining responsive. We'll
  // eventually yield regardless, since there could be a pending paint that
  // wasn't accompanied by a call to `requestPaint`, or other main thread tasks
  // like network events.
  // 谷歌的特有，且是不是开启了这个，默认开启就行了
  if (enableIsInputPending) {
    if (needsPaint) {
      // There's a pending paint (signaled by `requestPaint`). Yield now.
      return true;
    } 
    // 在输入的时候最多50ms就一帧，不能卡死
    if (timeElapsed < continuousInputInterval) {
      // We haven't blocked the thread for that long. Only yield if there's a
      // pending discrete input (e.g. click). It's OK if there's pending
      // continuous input (e.g. mouseover).
      if (isInputPending !== null) {
        return isInputPending();
      }
    } else if (timeElapsed < maxInterval) {
      // Yield if there's either a pending discrete or continuous input.
      if (isInputPending !== null) {
        return isInputPending(continuousOptions);
      }
    } else {
      // We've blocked the thread for a long time. Even if there's no pending
      // input, there may be some other scheduled work that we don't know about,
      // like a network event. Yield now.
      return true;
    }
  }

  // `isInputPending` isn't available. Yield now.
  // 反正如果没isInputPending，且大于5ms，直接让出
  return true;
}
```
### performWorkUntilDeadline

```plain
const performWorkUntilDeadline = () => {
  // 判断这个是不是空，是的话直接告诉循环完事了，不是就hasMoreWork 是不是还有，也就是workLoop返回的值。
  // 有就继续执行这个schedulePerformWorkUntilDeadline，相当于继续requestHostCallback。一直到loop完事。
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    // Keep track of the start time so we can measure how long the main thread
    // has been blocked.
    startTime = currentTime;
    const hasTimeRemaining = true;

    // If a scheduler task throws, exit the current browser task so the
    // error can be observed.
    //
    // Intentionally not using a try-catch, since that makes some debugging
    // techniques harder. Instead, if `scheduledHostCallback` errors, then
    // `hasMoreWork` will remain true, and we'll continue the work loop.
    let hasMoreWork = true;
    try {
      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
    } finally {
      if (hasMoreWork) {
        // If there's more work, schedule the next message event at the end
        // of the preceding one.
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      }
    }
  } else {
    isMessageLoopRunning = false;
  }
  // Yielding to the browser will give it a chance to paint, so we can
  // reset this.
  needsPaint = false;
};
```

### schedulePerformWorkUntilDeadline

不同环境的实现，主流浏览器是MessageChannel实现，因为这个是宏任务，在最后执行。localSetImmediate是Node或者iE。localSetTimeout这个我也不知道是啥。执行的是performWorkUntilDeadline。也就是next task的启动。

```plain
let schedulePerformWorkUntilDeadline;
if (typeof localSetImmediate === 'function') {
  // Node.js and old IE.
  // There's a few reasons for why we prefer setImmediate.
  //
  // Unlike MessageChannel, it doesn't prevent a Node.js process from exiting.
  // (Even though this is a DOM fork of the Scheduler, you could get here
  // with a mix of Node.js 15+, which has a MessageChannel, and jsdom.)
  // https://github.com/facebook/react/issues/20756
  //
  // But also, it runs earlier which is the semantic we want.
  // If other browsers ever implement it, it's better to use it.
  // Although both of these would be inferior to native scheduling.
  schedulePerformWorkUntilDeadline = () => {
    localSetImmediate(performWorkUntilDeadline);
  };
} else if (typeof MessageChannel !== 'undefined') {
  // DOM and Worker environments.
  // We prefer MessageChannel because of the 4ms setTimeout clamping.
  const channel = new MessageChannel();
  const port = channel.port2;
  channel.port1.onmessage = performWorkUntilDeadline;
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
  };
} else {
  // We should only fallback here in non-browser environments.
  schedulePerformWorkUntilDeadline = () => {
    localSetTimeout(performWorkUntilDeadline, 0);
  };
}
```
### 总结

就是给触发了的任务做个优先顺序，然后按序进入reconciler，这是更新fiber的过程。也就是render阶段。**currentTask.callback**就是执行的任务回调。

简单粗暴来看，就是unstable_scheduleCallback启动，通过是不是还剩下task来决定是否要继续执行schedulePerformWorkUntilDeadline。

而workloop则是判断时间剩余去执行任务的回调。

用一个简单粗暴的方式写或许大家就懂了。

```plain

const workloop = () => {
      if(当前剩余时间){
        执行task 回调
      }
      if(还有任务) {
        requestAnimationFrame(workloop)
      }
    }
    workloop()

```

# 
