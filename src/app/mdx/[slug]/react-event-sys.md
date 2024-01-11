# react 事件系统

事件注册在render时，

**listenToAllSupportedEvents**(rootContainerElement);

rootContainerElement为一般container。就是render挂载的APP。

```typescript
function listenToAllSupportedEvents(rootContainerElement) {
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true;

    allNativeEvents.forEach(function (domEventName) {
      // We handle selectionchange separately because it
      // doesn't bubble and needs to be on the document.
      if (domEventName !== 'selectionchange') {
        if (!nonDelegatedEvents.has(domEventName)) {
          listenToNativeEvent(domEventName, false, rootContainerElement);
        }

        listenToNativeEvent(domEventName, true, rootContainerElement);
      }
    });
    var ownerDocument = rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;



    if (ownerDocument !== null) {
      // The selectionchange event also needs deduplication
      // but it is attached to the document.
      if (!ownerDocument[listeningMarker]) {
        ownerDocument[listeningMarker] = true;
        listenToNativeEvent('selectionchange', false, ownerDocument);
      }
    }
  }
}
```
看代码可以知道，除了selectionchange绑定在document，其他事件都是在#root上。
addTrappedEventListener

```typescript
function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener, isDeferredListenerForLegacyFBSupport) {
  // 创建有优先级的监听函数，也就是为什么在合成事件中的更新是异步的。不过react18之后全部都是异步。
  var listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags); // If passive option is not supported, then the event will be
  // active and not passive.

  var isPassiveListener = undefined;

  if (passiveBrowserEventsSupported) {
    // Browsers introduced an intervention, making these events
    // passive by default on document. React doesn't bind them
    // to document anymore, but changing this now would undo
    // the performance wins from the change. So we emulate
    // the existing behavior manually on the roots now.
    // https://github.com/facebook/react/issues/19651
    if (domEventName === 'touchstart' || domEventName === 'touchmove' || domEventName === 'wheel') {
      isPassiveListener = true;
    }
  }

  targetContainer =  targetContainer;
  var unsubscribeListener; // When legacyFBSupport is enabled, it's for when we



  if (isCapturePhaseListener) {
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventCaptureListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener);
    } else {
      unsubscribeListener = addEventCaptureListener(targetContainer, domEventName, listener);
    }
  } else {
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventBubbleListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener);
    } else {
      unsubscribeListener = addEventBubbleListener(targetContainer, domEventName, listener);
    }
  }
}

```


createEventListenerWrapperWithPriority

```typescript
function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
  var eventPriority = getEventPriority(domEventName);
  var listenerWrapper;

  switch (eventPriority) {
    // 鼠标事件什么的乱七八糟的都是优先级比较高的，触发频率不高。
    case DiscreteEventPriority:
      listenerWrapper = dispatchDiscreteEvent;
      break;
    // 拖拽滚动移动这些优先级其次，触发频率很高
    case ContinuousEventPriority:
      listenerWrapper = dispatchContinuousEvent;
      break;
    // 默认
    case DefaultEventPriority:
    default:
      // 好像这个不需要搞优先级，直接执行？
      listenerWrapper = dispatchEvent;
      break;
  }

  return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
}
```
attemptToDispatchEvent
个人觉得这个才是react事件合成系统的触发的关键，它找到target，并且把当前的**target.internalInstanceKey=fiberNode。也就是说，每个element都挂着对应的fiber。这个有点离谱。**

不过这些步骤是在**createInstance**的时候**precacheFiberNode完成的**。completeWork的时候生成stateNode。

```typescript
function attemptToDispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  // TODO: Warn if _enabled is false.
  var nativeEventTarget = getEventTarget(nativeEvent);
  var targetInst = getClosestInstanceFromNode(nativeEventTarget);

  if (targetInst !== null) {
    var nearestMounted = getNearestMountedFiber(targetInst);

    if (nearestMounted === null) {
      // This tree has been unmounted already. Dispatch without a target.
      targetInst = null;
    } else {
      var tag = nearestMounted.tag;

      if (tag === SuspenseComponent) {
        var instance = getSuspenseInstanceFromFiber(nearestMounted);

        if (instance !== null) {
          // Queue the event to be replayed later. Abort dispatching since we
          // don't want this event dispatched twice through the event system.
          // TODO: If this is the first discrete event in the queue. Schedule an increased
          // priority for this boundary.
          return instance;
        } // This shouldn't happen, something went wrong but to avoid blocking
        // the whole system, dispatch the event without a target.
        // TODO: Warn.



        targetInst = null;
      } else if (tag === HostRoot) {
        var root = nearestMounted.stateNode;

        if (root.isDehydrated) {
          // If this happens during a replay something went wrong and it might block
          // the whole system.
          return getContainerFromFiber(nearestMounted);
        }

        targetInst = null;
      } else if (nearestMounted !== targetInst) {
        // If we get an event (ex: img onload) before committing that
        // component's mount, ignore it for now (that is, treat it as if it was an
        // event on a non-React tree). We might also consider queueing events and
        // dispatching them after the mount.
        targetInst = null;
      }
    }
  }

  dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer); // We're not blocked on anything.

  return null;
}
```
总结：
事件全部注册在root，每次触发的时候执行最终执行 dispatchEvent。

dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent)

最关键的是**nativeEvent。通过原生**nativeEvent**找到目标真实节点。**

**在completeWork的时候**createInstance，执行了这个函数。

```typescript
function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}
```
也就是把dom树上每个hostInst都挂着对应的fiber。
然后在fiber中的props里边找到注册的事件，并且返回执行。

