import invariant from "invariant"
import {
  supportsHistory,
  canUseDOM,
  addEventListener,
  removeEventListener
} from "./DOMUtils"
import { loopAsync } from './AsyncUtils'
import { createPath } from './PathUtils'
import {
  saveState,
  readState
} from './DOMStateStorage'
import runTransitionHook from './runTransitionHook'
import {
  CreateKey,
  CreateLocation,
  createLocation as _createLocation,
  statesAreEqual,
  locationsAreEqual,
  defaultGetUserConfirmation
} from './LocationUtils'
import Actions, { POP, PUSH, REPLACE } from './Actions'
import { Hook } from './runTransitionHook'
import {
  Location,
  BaseLocation,
  GetCurrentLocation,
  Listen,
  ListenBefore,
  TransitionTo,
  Push,
  Replace,
  GoBack,
  GoForward,
  CreateHref,
  CreateHistory,
  GetUserConfirmation,
  PushLocation,
  ReplaceLocation
} from './type'
/**
 * Utils
 */ 
/**
 * Base Utils
 */
export interface UpdateLocation {
  (location: Location): void;
}

export interface StopListener {
  (): void
}

// Browser
export interface GetCurrentIndex {
  (): number
}

export interface UpdateState {
  (state: object, path: string): void
}

export interface ConfirmTransitionTo {
  (location: Location, callback: (ok: any) => void): void
}

export interface StartListener {
  (listener: Hook, before: boolean): StopListener
}

export interface IsExtraneousPopstateEvent {
  (event: PopStateEvent): boolean
}
const isExtraneousPopstateEvent: IsExtraneousPopstateEvent
  = event => event.state === undefined 
    && navigator.userAgent.indexOf('CriOS') === -1

export interface PopEventListener {
  (event: PopStateEvent): void
}

const PopStateEventState = 'popstate'

/**
 * createBrowserHistory
 * 
 * Creates and returns a history object that uses HTML5's history API
 * (pushState, replaceState, and the popstate event) to manage history.
 * This is the recommended method of managing history in browsers because
 * it provides the cleanest URLs.
 *
 * Note: In browsers that do not support the HTML5 history API full
 * page reloads will be used to preserve clean URLs. You can force this
 * behavior using { forceRefresh: true } in options.
 */

const createBrowserHistory: CreateHistory<'NORMAL'> = (
  options = { hashType: 'slash' }
) => {
  invariant(canUseDOM, "Browser history needs a DOM")

  // Browser
  function createBroserverLocation(historyState: any): Location {
    const key: string = (historyState && historyState.key) || ''

    return _createLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: (key ? readState(key) : undefined)
    }, undefined, key)
  }

  function startListenerBrowser(listener: Hook): StopListener {
    const handlePopState: PopEventListener = (event: PopStateEvent) => {
      // Ignore extraneous popstate events in WebKit
      if (isExtraneousPopstateEvent(event)) return
      listener(createBroserverLocation(event.state))
    }

    addEventListener(
      window,
      PopStateEventState,
      handlePopState as EventListener
    )

    return () =>
      removeEventListener(
        window,
        PopStateEventState,
        handlePopState as EventListener
      )
  }

  function updateLocationBrow(
    location: Location,
    updateState: UpdateState
  ): void {
    const { state, key } = location

    if (state !== undefined) {
      saveState(key, state)
    }

    updateState({ key }, createPath(location))
  }

  const getUserConfirmation =
    options.getUserConfirmation || defaultGetUserConfirmation

  function go(n: number) {
    if (n) {
      window.history.go(n)
    }
  }

  function getCurrentLocationBrow(): Location {
    let historyState: any
    try {
      historyState = window.history.state || {}
    } catch (error) {
      // IE 11 sometimes throws when accessing window.history.state
      // See https://github.com/ReactTraining/history/pull/289
      historyState = {}
    }

    return createBroserverLocation(historyState)
  }

  function pushLocationBrow(location: Location): boolean {
    updateLocationBrow(
      location,
      (state: object, path: string) =>
        window.history.pushState(state, '', path)
    )
    return true
  }

  function replaceLocationBrow(location: Location): boolean {
    updateLocationBrow(location, (state: object, path: string) =>
      window.history.replaceState(state, '', path)
    )
    return true
  }

  // Refresh
  function getCurrentLocationRefresh(): Location {
    return _createLocation(window.location)
  }

  function pushLocationRefresh(location: Location): boolean {
    window.location.href = createPath(location)
    return false // Don't update location
  }

  function replaceLocationRefresh(location: Location): boolean {
    window.location.replace(createPath(location))
    return false // Don't update location
  }

  const useRefresh: boolean = options.forceRefresh || !supportsHistory()

  const getCurrentLocation = useRefresh
    ? getCurrentLocationRefresh
    : getCurrentLocationBrow
  const pushLocation = useRefresh
    ? pushLocationRefresh
    : pushLocationBrow
  const replaceLocation = useRefresh
    ? replaceLocationRefresh
    : replaceLocationBrow
  const { keyLength } = options

  let currentLocation: Location
  let pendingLocation: Location | null
  let beforeHooks: Hook[] = []
  let hooks: Hook[] = []
  let allKeys: string[] = []

  function getCurrentIndex(): number {
    if (pendingLocation && pendingLocation.action === Actions.POP)
      return allKeys.indexOf(pendingLocation.key || '')

    if (currentLocation)
      return allKeys.indexOf(currentLocation.key || '')

    return -1
  }

  function updateLocation(nextLocation: Location): void {
    const currentIndex = getCurrentIndex()
    currentLocation = nextLocation

    if (currentLocation.action === PUSH) {
      allKeys = [ ...allKeys.slice(0, currentIndex + 1), currentLocation.key ]
    } else if (currentLocation.action === REPLACE) {
      allKeys[currentIndex] = currentLocation.key
    }

    hooks.forEach(hook => hook(currentLocation))
  }

  function listenBefore(listener: Hook<Location>): () => void {
    return  startListener(listener, true)
  }

  function listen(listener: Hook<Location>): () => void {
    return startListener(listener, false)
  }

  function confirmTransitionTo(location: Location, callback: (ok: any) => void): void {
    loopAsync(
      beforeHooks.length,
      (index, next, done) => {
        runTransitionHook(beforeHooks[index], location, (result) =>
          result != null ? done(result) : next()
        )
      },
      (message) => {
        if (getUserConfirmation && typeof message === 'string') {
          getUserConfirmation(message, (ok: boolean) => callback(ok !== false))
        } else {
          callback(message !== false)
        }
      }
    )
  }

  function transitionTo(nextLocation: Location): void {
    if (
      (currentLocation && locationsAreEqual(currentLocation, nextLocation)) ||
      (pendingLocation && locationsAreEqual(pendingLocation, nextLocation))
    ) {
      return // Nothing to do
    }

    pendingLocation = nextLocation

    confirmTransitionTo(nextLocation, (ok) => {
      if (pendingLocation !== nextLocation)
        return // Transition was interrupted during confirmation

      pendingLocation = null

      if (ok) {
        // Treat PUSH to same path like REPLACE to be consistent with browsers
        if (nextLocation.action === PUSH) {
          const prevPath = createPath(currentLocation)
          const nextPath = createPath(nextLocation)

          if (
            nextPath === prevPath
            && statesAreEqual(currentLocation.state, nextLocation.state)
          ) {
            nextLocation.action = REPLACE
          }
        }

        if (nextLocation.action === POP) {
          updateLocation(nextLocation)
        } else if (nextLocation.action === PUSH) {
          if (pushLocation(nextLocation) !== false) {
            updateLocation(nextLocation)
          }
        } else if (nextLocation.action === REPLACE) {
          if (replaceLocation(nextLocation) !== false) {
            updateLocation(nextLocation)
          }
        }
      } else if (currentLocation && nextLocation.action === POP) {
        const prevIndex = allKeys.indexOf(currentLocation.key)
        const nextIndex = allKeys.indexOf(nextLocation.key)

        if (prevIndex !== -1 && nextIndex !== -1) {
          go(prevIndex - nextIndex) // Restore the URL
        }
      }
    })
  }

  function push(input: BaseLocation | string): void {
    transitionTo(createLocation(input, PUSH))
  }

  function replace(input: BaseLocation | string): void {
    transitionTo(createLocation(input, REPLACE))
  }

  function goBack() {
    go(-1)
  }

  function goForward() {
    go(1)
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength || 6)
  }

  function createHref(location: BaseLocation | string): string {
    return createPath(location)
  }

  function createLocation(
    input?: BaseLocation | string,
    action?: Actions,
    key: string = createKey()
  ): Location {
    return _createLocation(input, action, key)
  }

  let listenerCount: number = 0
  let stopListener: StopListener

  function _listenBefore(hook: Hook<Location>): () => void {
    beforeHooks.push(hook)

    return () => {
      beforeHooks = beforeHooks.filter(item => item !== hook)
    }
  }

  function _listen(hook: Hook<Location>): () => void {
    hooks.push(hook)

    return () => {
      hooks = hooks.filter(item => item !== hook)
    }
  }

  function startListener(listener: Hook<Location>, before: boolean): () => void {
    if (++listenerCount === 1)
      stopListener = startListenerBrowser(transitionTo)

    const unlisten = before
      ? _listenBefore(listener)
      : _listen(listener)

    return () => {
      unlisten()

      if (--listenerCount === 0) stopListener()
    }
  }

  return {
    getCurrentLocation,
    listenBefore,
    listen,
    transitionTo,
    push,
    replace,
    go,
    goBack,
    goForward,
    createKey,
    createPath,
    createHref,
    createLocation
  }
}

export default createBrowserHistory
