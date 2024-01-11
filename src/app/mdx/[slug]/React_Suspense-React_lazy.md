# React.Suspense | React.lazy 原理
lazy核心代码。这个是在react中实现的。但是运行在react-dom。

```typescript
function lazyInitializer(payload) {
 
  if (payload._status === Uninitialized) {
    var ctor = payload._result;
    var thenable = ctor(); // Transition to the next state.
    // This might throw either because it's missing or throws. If so, we treat it
    // as still uninitialized and try again next time. Which is the same as what
    // happens if the ctor or any wrappers processing the ctor throws. This might
    // end up fixing it if the resolution was a concurrency bug.

    thenable.then(function (moduleObject) {
      if (payload._status === Pending || payload._status === Uninitialized) {
        // Transition to the next state.
        var resolved = payload;
        resolved._status = Resolved;
        resolved._result = moduleObject;
      }
    }, function (error) {
      if (payload._status === Pending || payload._status === Uninitialized) {
        // Transition to the next state.
        var rejected = payload;
        rejected._status = Rejected;
        rejected._result = error;
      }
    });

    if (payload._status === Uninitialized) {
      // In case, we're still uninitialized, then we're waiting for the thenable
      // to resolve. Set it as pending in the meantime.
      var pending = payload;
      pending._status = Pending;
      pending._result = thenable;
    }

 
  }

 

  if (payload._status === Resolved) {
    var moduleObject = payload._result;

    {
      if (moduleObject === undefined) {
        error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
        'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))\n\n" + 'Did you accidentally put curly braces around the import?', moduleObject);
      }
    }

    {
      if (!('default' in moduleObject)) {
        error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
        'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))", moduleObject);
      }
    }

    return moduleObject.default;
  } else {
    throw payload._result;
  }
}
```
lazyInitializer ，如果状态是Uninitialized（未初始化），将thenable赋值给payload._result（promise，pendding状态），并且**抛出错误**。
需要注意的是，它是用抛出错误方式去告诉react这是一个带有Suspense的lazy组件。

也就是说，lazy组件必须使用Suspense包裹。

核心代码在handleError中执行。

```typescript
function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
  // The source fiber did not complete.
  sourceFiber.flags |= Incomplete;

  {
    if (isDevToolsPresent) {
      // If we have pending work still, restore the original updaters
      restorePendingUpdaters(root, rootRenderLanes);
    }
  }

  if (value !== null && typeof value === 'object' && typeof value.then === 'function') {
    // This is a wakeable. The component suspended.
    var wakeable = value;
    resetSuspendedComponent(sourceFiber);



    var suspenseBoundary = getNearestSuspenseBoundaryToCapture(returnFiber);

    if (suspenseBoundary !== null) {
      suspenseBoundary.flags &= ~ForceClientRender;
      markSuspenseBoundaryShouldCapture(suspenseBoundary, returnFiber, sourceFiber, root, rootRenderLanes);
      attachWakeableListeners(suspenseBoundary, root, wakeable, rootRenderLanes);
      return;
    } else {
      // No boundary was found. Fallthrough to error mode.
      // TODO: We should never call getComponentNameFromFiber in production.
      // Log a warning or something to prevent us from accidentally bundling it.
      value = new Error((getComponentNameFromFiber(sourceFiber) || 'A React component') + ' suspended while rendering, but no fallback UI was specified.\n' + '\n' + 'Add a <Suspense fallback=...> component higher in the tree to ' + 'provide a loading indicator or placeholder to display.');
    }
  } else {
    // This is a regular error, not a Suspense wakeable.
    if (getIsHydrating() && sourceFiber.mode & ConcurrentMode) {
      var _suspenseBoundary = getNearestSuspenseBoundaryToCapture(returnFiber); // If the error was thrown during hydration, we may be able to recover by
      // discarding the dehydrated content and switching to a client render.
      // Instead of surfacing the error, find the nearest Suspense boundary
      // and render it again without hydration.



      if (_suspenseBoundary !== null) {
        if ((_suspenseBoundary.flags & ShouldCapture) === NoFlags) {
          // Set a flag to indicate that we should try rendering the normal
          // children again, not the fallback.
          _suspenseBoundary.flags |= ForceClientRender;
        }

        markSuspenseBoundaryShouldCapture(_suspenseBoundary, returnFiber, sourceFiber, root, rootRenderLanes);
        return;
      }
    }
  } // We didn't find a boundary that could handle this type of exception. Start
  // over and traverse parent path again, this time treating the exception
  // as an error.



   .....
}
```
判断是否promise.then，如果是则判断是否存在suspenseBoundary。没有的话throw  error，代码直接跪。
如果存在的话，markSuspenseBoundaryShouldCapture，然后在attachWakeableListeners把当前的wakeable加入Suspense 的更新队列更新链，然后return。

也就是lazy组件必须要通过Suspense 来驱动。

所以回到Suspense ，看看Suspense 是如何驱动的。

```typescript
function updateSuspenseComponent(current, workInProgress, renderLanes) {
  var nextProps = workInProgress.pendingProps; // This is used by DevTools to force a boundary to suspend.

  {
    if (shouldSuspend(workInProgress)) {
      workInProgress.flags |= DidCapture;
    }
  }

  var suspenseContext = suspenseStackCursor.current;
  var showFallback = false;
  var didSuspend = (workInProgress.flags & DidCapture) !== NoFlags;

  if (didSuspend || shouldRemainOnFallback(suspenseContext, current)) {
    // Something in this boundary's subtree already suspended. Switch to
    // rendering the fallback children.
    showFallback = true;
    workInProgress.flags &= ~DidCapture;
  } else {
    // Attempting the main content
    if (current === null || current.memoizedState !== null) {
      // This is a new mount or this boundary is already showing a fallback state.
      // Mark this subtree context as having at least one invisible parent that could
      // handle the fallback state.
      // Avoided boundaries are not considered since they cannot handle preferred fallback states.
      if (nextProps.unstable_avoidThisFallback !== true) {
        suspenseContext = addSubtreeSuspenseContext(suspenseContext, InvisibleParentSuspenseContext);
      }
    }
  }

  suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
  pushSuspenseContext(workInProgress, suspenseContext); // OK, the next part is confusing. We're about to reconcile the Suspense
  // boundary's children. This involves some custom reconciliation logic. Two
  // main reasons this is so complicated.
  //
  // First, Legacy Mode has different semantics for backwards compatibility. The
  // primary tree will commit in an inconsistent state, so when we do the
  // second pass to render the fallback, we do some exceedingly, uh, clever
  // hacks to make that not totally break. Like transferring effects and
  // deletions from hidden tree. In Concurrent Mode, it's much simpler,
  // because we bailout on the primary tree completely and leave it in its old
  // state, no effects. Same as what we do for Offscreen (except that
  // Offscreen doesn't have the first render pass).
  //
  // Second is hydration. During hydration, the Suspense fiber has a slightly
  // different layout, where the child points to a dehydrated fragment, which
  // contains the DOM rendered by the server.
  //
  // Third, even if you set all that aside, Suspense is like error boundaries in
  // that we first we try to render one tree, and if that fails, we render again
  // and switch to a different tree. Like a try/catch block. So we have to track
  // which branch we're currently rendering. Ideally we would model this using
  // a stack.

  if (current === null) {
    // Initial mount
    // If we're currently hydrating, try to hydrate this boundary.
    tryToClaimNextHydratableInstance(workInProgress); // This could've been a dehydrated suspense component.

    {
      var suspenseState = workInProgress.memoizedState;

      if (suspenseState !== null) {
        var dehydrated = suspenseState.dehydrated;

        if (dehydrated !== null) {
          return mountDehydratedSuspenseComponent(workInProgress, dehydrated);
        }
      }
    }

    var nextPrimaryChildren = nextProps.children;
    var nextFallbackChildren = nextProps.fallback;

    if (showFallback) {
      var fallbackFragment = mountSuspenseFallbackChildren(workInProgress, nextPrimaryChildren, nextFallbackChildren, renderLanes);
      var primaryChildFragment = workInProgress.child;
      primaryChildFragment.memoizedState = mountSuspenseOffscreenState(renderLanes);
      workInProgress.memoizedState = SUSPENDED_MARKER;
      return fallbackFragment;
    } else if (typeof nextProps.unstable_expectedLoadTime === 'number') {
      // This is a CPU-bound tree. Skip this tree and show a placeholder to
      // unblock the surrounding content. Then immediately retry after the
      // initial commit.
      var _fallbackFragment = mountSuspenseFallbackChildren(workInProgress, nextPrimaryChildren, nextFallbackChildren, renderLanes);

      var _primaryChildFragment = workInProgress.child;
      _primaryChildFragment.memoizedState = mountSuspenseOffscreenState(renderLanes);
      workInProgress.memoizedState = SUSPENDED_MARKER; // Since nothing actually suspended, there will nothing to ping this to
      // get it started back up to attempt the next item. While in terms of
      // priority this work has the same priority as this current render, it's
      // not part of the same transition once the transition has committed. If
      // it's sync, we still want to yield so that it can be painted.
      // Conceptually, this is really the same as pinging. We can use any
      // RetryLane even if it's the one currently rendering since we're leaving
      // it behind on this node.

      workInProgress.lanes = SomeRetryLane;
      return _fallbackFragment;
    } else {
      return mountSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
    }
  } else {
    // This is an update.
    // If the current fiber has a SuspenseState, that means it's already showing
    // a fallback.
    var prevState = current.memoizedState;

    if (prevState !== null) {
      // The current tree is already showing a fallback
      // Special path for hydration
      {
        var _dehydrated = prevState.dehydrated;

        if (_dehydrated !== null) {
          if (!didSuspend) {
            return updateDehydratedSuspenseComponent(current, workInProgress, _dehydrated, prevState, renderLanes);
          } else if (workInProgress.flags & ForceClientRender) {
            // Something errored during hydration. Try again without hydrating.
            workInProgress.flags &= ~ForceClientRender;
            return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
          } else if (workInProgress.memoizedState !== null) {
            // Something suspended and we should still be in dehydrated mode.
            // Leave the existing child in place.
            workInProgress.child = current.child; // The dehydrated completion pass expects this flag to be there
            // but the normal suspense pass doesn't.

            workInProgress.flags |= DidCapture;
            return null;
          } else {
            // Suspended but we should no longer be in dehydrated mode.
            // Therefore we now have to render the fallback.
            var _nextPrimaryChildren = nextProps.children;
            var _nextFallbackChildren = nextProps.fallback;
            var fallbackChildFragment = mountSuspenseFallbackAfterRetryWithoutHydrating(current, workInProgress, _nextPrimaryChildren, _nextFallbackChildren, renderLanes);
            var _primaryChildFragment2 = workInProgress.child;
            _primaryChildFragment2.memoizedState = mountSuspenseOffscreenState(renderLanes);
            workInProgress.memoizedState = SUSPENDED_MARKER;
            return fallbackChildFragment;
          }
        }
      }

      if (showFallback) {
        var _nextFallbackChildren2 = nextProps.fallback;
        var _nextPrimaryChildren2 = nextProps.children;

        var _fallbackChildFragment = updateSuspenseFallbackChildren(current, workInProgress, _nextPrimaryChildren2, _nextFallbackChildren2, renderLanes);

        var _primaryChildFragment3 = workInProgress.child;
        var prevOffscreenState = current.child.memoizedState;
        _primaryChildFragment3.memoizedState = prevOffscreenState === null ? mountSuspenseOffscreenState(renderLanes) : updateSuspenseOffscreenState(prevOffscreenState, renderLanes);
        _primaryChildFragment3.childLanes = getRemainingWorkInPrimaryTree(current, renderLanes);
        workInProgress.memoizedState = SUSPENDED_MARKER;
        return _fallbackChildFragment;
      } else {
        var _nextPrimaryChildren3 = nextProps.children;

        var _primaryChildFragment4 = updateSuspensePrimaryChildren(current, workInProgress, _nextPrimaryChildren3, renderLanes);

        workInProgress.memoizedState = null;
        return _primaryChildFragment4;
      }
    } else {
      // The current tree is not already showing a fallback.
      if (showFallback) {
        // Timed out.
        var _nextFallbackChildren3 = nextProps.fallback;
        var _nextPrimaryChildren4 = nextProps.children;

        var _fallbackChildFragment2 = updateSuspenseFallbackChildren(current, workInProgress, _nextPrimaryChildren4, _nextFallbackChildren3, renderLanes);

        var _primaryChildFragment5 = workInProgress.child;
        var _prevOffscreenState = current.child.memoizedState;
        _primaryChildFragment5.memoizedState = _prevOffscreenState === null ? mountSuspenseOffscreenState(renderLanes) : updateSuspenseOffscreenState(_prevOffscreenState, renderLanes);
        _primaryChildFragment5.childLanes = getRemainingWorkInPrimaryTree(current, renderLanes); // Skip the primary children, and continue working on the
        // fallback children.

        workInProgress.memoizedState = SUSPENDED_MARKER;
        return _fallbackChildFragment2;
      } else {
        // Still haven't timed out. Continue rendering the children, like we
        // normally do.
        var _nextPrimaryChildren5 = nextProps.children;

        var _primaryChildFragment6 = updateSuspensePrimaryChildren(current, workInProgress, _nextPrimaryChildren5, renderLanes);

        workInProgress.memoizedState = null;
        return _primaryChildFragment6;
      }
    }
  }
}
```
current===null的情况下：
showFallback判断是否现实callback的组件，但是这里发现了个奇怪的问题，**unstable_expectedLoadTime**这个props参数，测试了一下似乎没什么改变。react预留出来的吧。有点像promise.allsettled的功能。

好像最后只是加入了Suspense 的更新队列，并没有做任何驱动？不过commitRoot还会重新调度，难道就是为了给这个用的？迷。

