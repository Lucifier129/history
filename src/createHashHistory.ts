import warning from "warning"
import invariant from "invariant"
import { loopAsync } from './AsyncUtils'
import {
  supportsGoWithoutReloadUsingHash,
  canUseDOM,
  addEventListener,
  removeEventListener
} from "./DOMUtils"
import {
  createPath,
  CreatePath,
  addQueryStringValueToPath,
  stripQueryStringValueFromPath,
  getQueryStringValueFromPath,
  parsePath
} from './PathUtils'
import { Hook } from "./runTransitionHook"
import { PathCoders, PathCoder, HistoryOptions } from './type'
import {
  NativeLocation,
  DraftLocation,
  createLocation as _createLocation,
  statesAreEqual,
  locationsAreEqual
} from './LocationUtils'
import { saveState, readState } from './DOMStateStorage'
import Actions, { POP, PUSH, REPLACE } from './Actions'
import runTransitionHook from './runTransitionHook'

interface GetCurrentLocation {
  (): NativeLocation
}

interface Unlisten {
  (): void
}

interface ListenBefore {
  (hook: Hook): Unlisten
}

interface Listen {
  (hook: Hook): Unlisten;
}

interface ListenBeforeUnload {
  (hook: Hook): Unlisten
}

interface TransitionTo {
  (nextLocation: NativeLocation): void;
}

interface Push {
  (input: DraftLocation | string): Function | void;
}

interface Replace {
  (input: DraftLocation | string): Function | void;
}

interface Go {
  (n: number): void
}

interface GoBack {
  (): void;
}

interface GoForward {
  (): void;
}

interface CreateKey {
  (): string;
}

interface CreateHref {
  (path: string): string
}

interface CreateLocation {
  (
    location: DraftLocation | string,
    action?: Actions,
    key?: string
  ): NativeLocation;
}

interface HashHistory {
  getCurrentLocation: GetCurrentLocation
  listenBefore: ListenBefore
  listen: Listen
  listenBeforeUnload?: ListenBeforeUnload
  transitionTo: TransitionTo
  push: Push
  replace: Replace
  go: Go
  goBack: GoBack
  goForward: GoForward
  createKey: CreateKey
  createPath: CreatePath
  createHref: CreateHref
  createLocation: CreateLocation
}

interface CreateHashHistory {
  (options: HistoryOptions): HashHistory
}

/**
 * Utils
 */
interface PushLocation {
  (location: NativeLocation): boolean
}

interface ReplaceLocation {
  (location: NativeLocation): boolean
}

interface GetUserConfirmation {
  (message: string, callback: Function): any
}

interface StartListener {
  (listener: Hook, before: boolean): () => void
}

interface GetCurrentIndex {
  (): number;
}

interface UpdateLocation {
  (location: NativeLocation): void;
}

interface ConfirmTransitionTo {
  (location: NativeLocation, callback: (ok: any) => void): void;
}

/**
 * Hash
 */
interface PushPath {
  (path: string): string;
}

interface ReplacePath {
  (path: string): void;
}

interface Update {
  (path: string): void;
}

interface UpdateLocationHash {
  (
    location: NativeLocation,
    pathCoder: PathCoder,
    queryKey: string,
    updateHash: Update
  ): void;
}

interface PushLocationHash {
  (location: NativeLocation, pathCoder: PathCoder, queryKey: string): boolean
}

interface ReplaceLocationHash {
  (location: NativeLocation, pathCoder: PathCoder, queryKey: string): boolean
}
interface GetPath {
  (): string;
}

interface GetCurrentLocationHash {
  (pathCoder: PathCoder, queryKey: string): NativeLocation
}

interface CreateLocationHash {
  (
    location: DraftLocation | string,
    action?: Actions,
    key?: string
  ): NativeLocation;
}

interface PopEventListener {
  (event: PopStateEvent): void
}

interface StopListener {
  (): void
}

interface StartListenerHash {
  (
    listener: Function,
    pathCoder: PathCoder,
    queryKey: string
  ): StopListener;
}

const HashChangeEvent: string = 'hashchange'


const createHashHistory: CreateHashHistory = options => {
  invariant(canUseDOM, "Hash history needs a DOM")

  let { queryKey, hashType, keyLength } = options

  warning(
    queryKey !== 'false',
    'Using { queryKey: false } no longer works. Instead, just don\'t ' +
    'use location state if you don\'t want a key in your URL query string'
  )

  const DefaultQueryKey: string = "_k"

  const addLeadingSlash: (path: string) => string = path =>
    path.charAt(0) === "/" ? path : "/" + path

  const HashPathCoders: PathCoders = {
    hashbang: {
      encodePath: path => (path.charAt(0) === "!" ? path : "!" + path),
      decodePath: path => (path.charAt(0) === "!" ? path.substring(1) : path)
    },
    noslash: {
      encodePath: path => (path.charAt(0) === "/" ? path.substring(1) : path),
      decodePath: addLeadingSlash
    },
    slash: {
      encodePath: addLeadingSlash,
      decodePath: addLeadingSlash
    }
  }

  const pathCoder: PathCoder = HashPathCoders[hashType]

  if (typeof queryKey !== "string") queryKey = DefaultQueryKey

  if (hashType == null) hashType = "slash"

  if (!(hashType in HashPathCoders)) {
    warning(false, "Invalid hash type: %s", hashType)

    hashType = "slash"
  }

  // Base
  const getUserConfirmation: GetUserConfirmation
    = (message, callback) => callback(window.confirm(message)) // eslint-disable-line no-alert

  // Hash
  const pushHashPath: PushPath = (path) =>
    window.location.hash = path

  const replaceHashPath: ReplacePath = (path) => {
    const hashIndex: number = window.location.href.indexOf('#')

    window.location.replace(
      window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path
    )
  }


  let prevLocation: NativeLocation
  const updateLocationHash: UpdateLocationHash = (location, pathCoder, queryKey, updateHash) => {
    const { state, key } = location

    let path: string = pathCoder.encodePath(createPath(location))

    if (state !== undefined) {
      path = addQueryStringValueToPath(path, queryKey, key)
      saveState(key, state)
    }

    prevLocation = location

    updateHash(path)
  }
  const pushLocationHash: PushLocationHash = (location: NativeLocation, pathCoder: PathCoder, queryKey: string) => {
    updateLocationHash(location, pathCoder, queryKey, (path) => {
      if (getHashPath() !== path) {
        pushHashPath(path)
      } else {
        warning(false, 'You cannot PUSH the same path using hash history')
      }
    })
    return true
  }


  const replaceLocationHash: ReplaceLocationHash = (location: NativeLocation, pathCoder: PathCoder, queryKey: string) => {
    updateLocationHash(location, pathCoder, queryKey, (path) => {
      if (getHashPath() !== path)
        replaceHashPath(path)
    })
    return true
  }

  const getHashPath: GetPath = () => {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    const href: string = window.location.href
    const hashIndex: number = href.indexOf('#')
    return hashIndex === -1 ? '' : href.substring(hashIndex + 1)
  }

  const getCurrentLocationHash: GetCurrentLocationHash = (pathCoder: PathCoder, queryKey: string) => {
    let path: string = pathCoder.decodePath(getHashPath())
    const key: string = getQueryStringValueFromPath(path, queryKey)

    let state
    if (key) {
      path = stripQueryStringValueFromPath(path, queryKey)
      state = readState(key)
    }

    const init = parsePath(path)
    let newInit: DraftLocation = Object.assign(init, { state })

    return _createLocation(newInit, key)
  }

  const startListenerHash: StartListenerHash = (listener, pathCoder, queryKey) => {
    const handleHashChange: PopEventListener = () => {
      const path: string = getHashPath()
      const encodedPath: string = pathCoder.encodePath(path)

      if (path !== encodedPath) {
        // Always be sure we have a properly-encoded hash.
        replaceHashPath(encodedPath)
      } else {
        const currentLocation: NativeLocation = getCurrentLocationHash(pathCoder, queryKey)

        // Ignore extraneous hashchange events
        if (prevLocation) {
          if (currentLocation.key && prevLocation.key === currentLocation.key) {
            return
          }

          let curPath: string = currentLocation.pathname + currentLocation.search
          let prevPath: string = prevLocation.pathname + prevLocation.search

          // prepend basename if existed
          if (prevLocation.basename) {
            prevPath = prevLocation.basename + prevPath
          }

          if (prevPath === curPath) {
            return
          }
        }

        prevLocation = currentLocation

        listener(currentLocation)
      }
    }

    // Ensure the hash is encoded properly.
    const path: string = getHashPath()
    const encodedPath: string = pathCoder.encodePath(path)

    if (path !== encodedPath)
      replaceHashPath(encodedPath)

    addEventListener(window, HashChangeEvent, handleHashChange as EventListener)

    return () =>
      removeEventListener(window, HashChangeEvent, handleHashChange as EventListener)
  }

  // Base

  const getCurrentLocation: GetCurrentLocation = () =>
    getCurrentLocationHash(pathCoder, queryKey)

  const pushLocation: PushLocation = location =>
    pushLocationHash(location, pathCoder, queryKey)

  const replaceLocation: ReplaceLocation = location =>
    replaceLocationHash(location, pathCoder, queryKey)

  let listenerCount: number = 0
  let stopListener: Function

  const startListener: StartListener = (listener, before) => {
    if (++listenerCount === 1)
      stopListener = startListenerHash(
        transitionTo,
        pathCoder,
        queryKey
      )

    const unlisten = before
      ? _listenBefore(listener)
      : _listen(listener)

    return () => {
      unlisten()

      if (--listenerCount === 0) stopListener()
    }
  }


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
      allKeys = [...allKeys.slice(0, currentIndex + 1), currentLocation.key]
    } else if (currentLocation.action === REPLACE) {
      allKeys[currentIndex] = currentLocation.key
    }

    hooks.forEach(hook => hook(currentLocation))
  }

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

  const _createHref: CreateHref = (location) =>
    createPath(location)

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

  const createLocation: CreateLocation = (location, action, key = createKey()) =>
    _createLocation(location, key, action)

  const listenBefore: ListenBefore = listener => startListener(listener, true)

  const listen: Listen = listener => startListener(listener, false)

  const goIsSupportedWithoutReload: boolean = supportsGoWithoutReloadUsingHash()

  const go: Go = n => {
    warning(
      goIsSupportedWithoutReload,
      "Hash history go(n) causes a full page reload in this browser"
    )

    history.go(n)
  }

  const createHref: CreateHref = path =>
    "#" + pathCoder.encodePath(_createHref(path))

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

export default createHashHistory
