import invariant from "invariant"
import {
  supportsHistory,
  canUseDOM,
  addEventListener,
  removeEventListener
} from "./DOMUtils"
import { loopAsync } from './AsyncUtils'
import { createPath, CreatePath } from './PathUtils'
import { saveState, readState } from './DOMStateStorage'
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
  NativeLocation,
  GetCurrentLocation,
  Listen,
  ListenBefore,
  TransitionTo,
  Push,
  Replace,
  Go,
  GoBack,
  GoForward,
  CreateHref,
  CreateHistory,
  GetUserConfirmation
} from './type'

/**
 * BrowserHistoryOptions
 */

export interface PushLocation {
  (location: NativeLocation): boolean
}

export interface ReplaceLocation {
  (location: NativeLocation): boolean
}

/**
 * Utils
 */ 
/**
 * Base Utils
 */
export interface UpdateLocation {
  (location: NativeLocation): void;
}

export interface StopListener {
  (): void
}

export interface StartListenerBrowser {
  (listener: Hook): StopListener
}

export interface CreateBrowserLocation {
  (historyState: any): NativeLocation
}

// Browser
export interface GetCurrentIndex {
  (): number
}

export interface UpdateState {
  (state: object, path: string): void
}

export interface UpdateLocationBrow {
  (
    location: NativeLocation,
    updateState: UpdateState
  ): void
}

export interface ConfirmTransitionTo {
  (location: NativeLocation, callback: (ok: any) => void): void
}

export interface StartListener {
  (listener: Hook, before: boolean): StopListener
}

export interface IsExtraneousPopstateEvent {
  (event: PopStateEvent): boolean
}
const isExtraneousPopstateEvent: IsExtraneousPopstateEvent
  = event => event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1

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

const createBrowserHistory: CreateHistory<'NORMAL'> = (options = { hashType: 'slash' }) => {
  invariant(canUseDOM, "Browser history needs a DOM")

  // Default operator
  const getUserConfirmation: GetUserConfirmation = options.getUserConfirmation || defaultGetUserConfirmation

  const go: Go = (n) => {
    if (n)
      window.history.go(n)
  }

  // Browser
  const createBroserverLocation: CreateBrowserLocation = (historyState) => {
    const key: string = (historyState && historyState.key) || ''

    return _createLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: (key ? readState(key) : undefined)
    }, undefined, key)
  }

  const startListenerBrowser: StartListenerBrowser = (listener) => {
    const handlePopState: PopEventListener = (event: PopStateEvent) => {
      if (isExtraneousPopstateEvent(event)) return // Ignore extraneous popstate events in WebKit
      listener(createBroserverLocation(event.state))
    }

    addEventListener(window, PopStateEventState, handlePopState as EventListener)

    return () =>
      removeEventListener(window, PopStateEventState, handlePopState as EventListener)
  }

  const updateLocationBrow: UpdateLocationBrow = (location, updateState) => {
    const { state, key } = location

    if (state !== undefined) {
      saveState(key, state)
    }

    updateState({ key }, createPath(location))
  }

  const getCurrentLocationBrow: GetCurrentLocation = () => {
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

  const pushLocationBrow: PushLocation = (location) => {
    updateLocationBrow(
      location,
      (state: object, path: string) =>
        window.history.pushState(state, '', path)
    )
    return true
  }

  const replaceLocationBrow: ReplaceLocation = (location) => {
    updateLocationBrow(location, (state: object, path: string) =>
      window.history.replaceState(state, '', path)
    )
    return true
  }

  // Refresh
  const getCurrentLocationRefresh: GetCurrentLocation = () => {
    return _createLocation(window.location)
  }

  const pushLocationRefresh: PushLocation = (location) => {
    window.location.href = createPath(location)
    return false // Don't update location
  }

  const replaceLocationRefresh: ReplaceLocation = (location) => {
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

  let currentLocation: NativeLocation
  let pendingLocation: NativeLocation | null
  let beforeHooks: Hook[] = []
  let hooks: Hook[] = []
  let allKeys: string[] = []

  const getCurrentIndex: GetCurrentIndex = () => {
    if (pendingLocation && pendingLocation.action === Actions.POP)
      return allKeys.indexOf(pendingLocation.key || '')

    if (currentLocation)
      return allKeys.indexOf(currentLocation.key || '')

    return -1
  }

  const updateLocation: UpdateLocation = (nextLocation) => {
    const currentIndex = getCurrentIndex()
    currentLocation = nextLocation

    if (currentLocation.action === PUSH) {
      allKeys = [ ...allKeys.slice(0, currentIndex + 1), currentLocation.key ]
    } else if (currentLocation.action === REPLACE) {
      allKeys[currentIndex] = currentLocation.key
    }

    hooks.forEach(hook => hook(currentLocation))
  }

  const listenBefore: ListenBefore = listener => startListener(listener, true)

  const listen: Listen = listener => startListener(listener, false)

  const confirmTransitionTo: ConfirmTransitionTo = (location, callback) => {
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

  const transitionTo: TransitionTo = (nextLocation) => {
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

          if (nextPath === prevPath && statesAreEqual(currentLocation.state, nextLocation.state))
            nextLocation.action = REPLACE
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

  const push: Push = (input) =>
    transitionTo(createLocation(input, PUSH))

  const replace: Replace = (input) =>
    transitionTo(createLocation(input, REPLACE))

  const goBack: GoBack = () =>
    go(-1)

  const goForward: GoForward = () =>
    go(1)

  const createKey: CreateKey = () =>
    Math.random().toString(36).substr(2, keyLength || 6)

  const createHref: CreateHref = (location) =>
    createPath(location)

  const createLocation: CreateLocation = (location, action, key = createKey()) =>
    _createLocation(location, action, key)


  let listenerCount: number = 0
  let stopListener: StopListener

  const _listenBefore: ListenBefore = (hook) => {
    beforeHooks.push(hook)

    return () =>
    beforeHooks = beforeHooks.filter(item => item !== hook)
  }

  const _listen: Listen = (hook) => {
    hooks.push(hook)

    return () =>
      hooks = hooks.filter(item => item !== hook)
  }

  const startListener: StartListener = (listener, before) => {
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
