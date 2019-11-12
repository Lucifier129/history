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
  History,
  HistoryOptions,
  LocationTypeMap
} from './type'
/**
 * Utils
 */
export interface StopListener {
  (): void
}


export interface UpdateState {
  (state: object, path: string): void
}

function isExtraneousPopstateEvent(event: PopStateEvent): boolean {
  return (
    event.state === undefined 
      && navigator.userAgent.indexOf('CriOS') === -1
  )
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

export default function createBrowserHistory(
  options: HistoryOptions = { hashType: 'slash' }
): History<
  LocationTypeMap['NORMAL']['Base'],
  LocationTypeMap['NORMAL']['Intact']
> {
  invariant(canUseDOM, "Browser history needs a DOM")

  // Browser
  function createBroserverLocation<IL extends Location>(historyState: any): IL {
    const key: string = (historyState && historyState.key) || ''

    return _createLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: (key ? readState(key) : undefined)
    }, undefined, key)
  }

  function startListenerBrowser<IL extends Location>(listener: Hook<IL>): StopListener {
    function handlePopState(event: PopStateEvent): void {
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

  function updateLocationBrow<IL extends Location>(
    location: IL,
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

  function getCurrentLocationBrow<IL extends Location>(): IL {
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

  function replaceLocationBrow<IL extends Location>(location: IL): boolean {
    updateLocationBrow(location, (state: object, path: string) =>
      window.history.replaceState(state, '', path)
    )
    return true
  }

  // Refresh
  function getCurrentLocationRefresh<IL extends Location>(): IL {
    return _createLocation(window.location)
  }

  function pushLocationRefresh<IL extends Location>(location: IL): boolean {
    window.location.href = createPath(location)
    return false // Don't update location
  }

  function replaceLocationRefresh<IL extends Location>(location: IL): boolean {
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
  let beforeHooks: Hook<any>[] = []
  let hooks: Hook<any>[] = []
  let allKeys: string[] = []

  function getCurrentIndex(): number {
    if (pendingLocation && pendingLocation.action === Actions.POP)
      return allKeys.indexOf(pendingLocation.key || '')

    if (currentLocation)
      return allKeys.indexOf(currentLocation.key || '')

    return -1
  }

  function updateLocation<IL extends Location>(nextLocation: IL): void {
    const currentIndex = getCurrentIndex()
    currentLocation = nextLocation

    if (currentLocation.action === PUSH) {
      allKeys = [ ...allKeys.slice(0, currentIndex + 1), currentLocation.key ]
    } else if (currentLocation.action === REPLACE) {
      allKeys[currentIndex] = currentLocation.key
    }

    hooks.forEach(hook => hook(currentLocation))
  }

  function listenBefore<IL extends Location>(listener: Hook<IL>): StopListener {
    return  startListener(listener, true)
  }

  function listen<IL extends Location>(listener: Hook<IL>): StopListener {
    return startListener(listener, false)
  }

  function confirmTransitionTo<IL extends Location>(location: IL, callback: (ok: unknown) => void): void {
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

  function transitionTo<IL extends Location>(nextLocation: IL): void {
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

  function push<BL extends BaseLocation>(input: BL | string): void {
    transitionTo(createLocation(input, PUSH))
  }

  function replace<BL extends BaseLocation>(input: BL | string): void {
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

  function createHref<BL extends BaseLocation>(location: BL | string): string {
    return createPath(location)
  }

  function createLocation<BL extends BaseLocation>(
    input?: BL | string,
    action?: Actions,
    key: string = createKey()
  ): Location {
    return _createLocation(input, action, key)
  }

  let listenerCount: number = 0
  let stopListener: StopListener

  function _listenBefore<IL extends Location>(hook: Hook<IL>): StopListener {
    beforeHooks.push(hook)

    return () => {
      beforeHooks = beforeHooks.filter(item => item !== hook)
    }
  }

  function _listen<IL extends Location>(hook: Hook<IL>): StopListener {
    hooks.push(hook)

    return () => {
      hooks = hooks.filter(item => item !== hook)
    }
  }

  function startListener<IL extends Location>(listener: Hook<IL>, before: boolean): StopListener {
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
