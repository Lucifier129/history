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
  addQueryStringValueToPath,
  stripQueryStringValueFromPath,
  getQueryStringValueFromPath,
  parsePath
} from './PathUtils'
import { Hook } from "./runTransitionHook"
import {
  createLocation as _createLocation,
  statesAreEqual,
  locationsAreEqual,
  defaultGetUserConfirmation
} from './LocationUtils'
import {
  saveState,
  readState
} from './DOMStateStorage'
import Actions, {
  POP,
  PUSH,
  REPLACE
} from './Actions'
import runTransitionHook from './runTransitionHook'
import {
  Location,
  BaseLocation,
  ILWithBQ,
  PathCoders,
  PathCoder,
  HistoryOptions,
  GetUserConfirmation,
  History,
  LocationTypeMap,
  LocationType,
  Unlisten
} from './type'

export interface Update {
  (path: string): void
}

export interface StopListener {
  (): void
}

const HashChangeEvent: string = 'hashchange'

function createHashHistory<LT extends LocationType>(
  options: HistoryOptions = {}
): History<
  LocationTypeMap[LT]['Base'],
  LocationTypeMap[LT]['Intact']
>{
  invariant(canUseDOM, "Hash history needs a DOM")

  let { queryKey, hashType = 'slash', keyLength }: HistoryOptions = options

  warning(
    queryKey !== 'false',
    'Using { queryKey: false } no longer works. Instead, just don\'t ' +
    'use location state if you don\'t want a key in your URL query string'
  )

  const DefaultQueryKey: string = "_k"

  function addLeadingSlash(path: string): string {
    return path.charAt(0) === "/" ? path : "/" + path
  }

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
  const getUserConfirmation: GetUserConfirmation =
    options.getUserConfirmation || defaultGetUserConfirmation

  // Hash
  function pushHashPath(path: string): string {
    return window.location.hash = path
  }

  function replaceHashPath(path: string): void {
    const hashIndex: number = window.location.href.indexOf('#')

    window.location.replace(
      window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path
    )
  }

  let prevLocation: ILWithBQ

  function updateLocationHash<IL extends Location>(
    location: IL,
    pathCoder: PathCoder,
    queryKey: string,
    updateHash: Update
  ): void {
    const { state, key } = location

    let path: string = pathCoder.encodePath(createPath(location))

    if (state !== undefined) {
      path = addQueryStringValueToPath(path, queryKey, key)
      saveState(key, state)
    }

    prevLocation = {
      basename: '',
      query: {},
      ...location
    }

    updateHash(path)
  }
  function pushLocationHash<IL extends Location>(
    location: IL,
    pathCoder: PathCoder,
    queryKey: string
  ): boolean {
    updateLocationHash(location, pathCoder, queryKey, (path) => {
      if (getHashPath() !== path) {
        pushHashPath(path)
      } else {
        warning(false, 'You cannot PUSH the same path using hash history')
      }
    })
    return true
  }

  function replaceLocationHash<IL extends Location>(
    location: IL,
    pathCoder: PathCoder,
    queryKey: string
  ): boolean {
    updateLocationHash(location, pathCoder, queryKey, (path) => {
      if (getHashPath() !== path)
        replaceHashPath(path)
    })
    return true
  }

  function getHashPath(): string {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    const href: string = window.location.href
    const hashIndex: number = href.indexOf('#')
    return hashIndex === -1 ? '' : href.substring(hashIndex + 1)
  }

  function getCurrentLocationHash<IL extends Location>(
    pathCoder: PathCoder,
    queryKey: string
  ): IL {
    let path: string = pathCoder.decodePath(getHashPath())
    const key: string = getQueryStringValueFromPath(path, queryKey)

    let state
    if (key) {
      path = stripQueryStringValueFromPath(path, queryKey)
      state = readState(key)
    }

    const init = parsePath(path)
    let newInit: BaseLocation = Object.assign(init, { state })

    return _createLocation(newInit, undefined, key)
  }

  function startListenerHash(
    listener: Hook,
    pathCoder: PathCoder,
    queryKey: string
  ): StopListener {
    function handleHashChange(/* event: PopStateEvent */): void {
      const path: string = getHashPath()
      const encodedPath: string = pathCoder.encodePath(path)

      if (path !== encodedPath) {
        // Always be sure we have a properly-encoded hash.
        replaceHashPath(encodedPath)
      } else {
        const currentLocation: Location =
          getCurrentLocationHash(pathCoder, queryKey)

        // Ignore extraneous hashchange events
        if (prevLocation) {
          if (
            currentLocation.key
            && prevLocation.key === currentLocation.key
          ) {
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

        prevLocation = {
          basename: '',
          query: {},
          ...currentLocation
        }

        listener(currentLocation)
      }
    }

    // Ensure the hash is encoded properly.
    const path: string = getHashPath()
    const encodedPath: string = pathCoder.encodePath(path)

    if (path !== encodedPath)
      replaceHashPath(encodedPath)

    addEventListener(
      window,
      HashChangeEvent,
      handleHashChange as EventListener
    )

    return () =>
      removeEventListener(
        window,
        HashChangeEvent,
        handleHashChange as EventListener
      )
  }

  // Base
  function getCurrentLocation<IL extends Location>(): IL {
    return getCurrentLocationHash(pathCoder, queryKey || '')
  }

  function pushLocation<IL extends Location>(
    location: IL
  ): boolean {
    return pushLocationHash(location, pathCoder, queryKey || '')
  }

  function replaceLocation<IL extends Location>(
    location: IL
  ): boolean {
    return replaceLocationHash(location, pathCoder, queryKey || '')
  }

  let listenerCount: number = 0
  let stopListener: StopListener

  function startListener<IL extends Location>(
    listener: Hook<IL>,
    before: boolean
  ): () => void {
    if (++listenerCount === 1)
      stopListener = startListenerHash(
        transitionTo,
        pathCoder,
        queryKey || ''
      )

    const unlisten = before
      ? _listenBefore(listener)
      : _listen(listener)

    return () => {
      unlisten()

      if (--listenerCount === 0) stopListener()
    }
  }

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

  function updateLocation<IL extends Location>(
    nextLocation: IL
  ): void {
    const currentIndex = getCurrentIndex()
    currentLocation = nextLocation

    if (currentLocation.action === PUSH) {
      allKeys = [...allKeys.slice(0, currentIndex + 1), currentLocation.key]
    } else if (currentLocation.action === REPLACE) {
      allKeys[currentIndex] = currentLocation.key
    }

    hooks.forEach(hook => hook(currentLocation))
  }

  function _listenBefore<IL extends Location>(
    hook: Hook<IL>
  ): Unlisten {
    beforeHooks.push(hook)

    return () =>
      beforeHooks = beforeHooks.filter(item => item !== hook)
  }

  function _listen<IL extends Location>(
    hook: Hook<IL>
  ): Unlisten {
    hooks.push(hook)

    return () =>
      hooks = hooks.filter(item => item !== hook)
  }

  function _createHref<BL extends BaseLocation>(location: BL | string): string {
    return createPath(location)
  }

  function confirmTransitionTo<IL extends Location>(
    location: IL,
    callback: (ok: any) => void
  ): void {
    loopAsync(
      beforeHooks.length,
      (index, next, done) => {
        runTransitionHook(
          beforeHooks[index],
          location,
          (result) =>
            result != null ? done(result) : next()
        )
      },
      (message) => {
        if (getUserConfirmation && typeof message === 'string') {
          getUserConfirmation(
            message,
            (ok: boolean) => callback(ok !== false)
          )
        } else {
          callback(message !== false)
        }
      }
    )
  }

  function transitionTo<IL extends Location>(nextLocation: IL): void {
    if (
      (currentLocation && locationsAreEqual(currentLocation, nextLocation))
      || (pendingLocation && locationsAreEqual(pendingLocation, nextLocation))
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

  function goBack(): void {
    go(-1)
  }

  function goForward(): void {
    go(1)
  }

  function createKey(): string {
    return (
      Math
        .random()
        .toString(36)
        .substr(2, keyLength || 6)
    )
  }

  function createLocation<
    BL extends BaseLocation,
    IL extends Location
  >(
    location?: BL | string,
    action?: Actions,
    key: string = createKey()
  ): IL {
    return _createLocation(location, action, key)
  }

  function listenBefore<IL extends Location>(
    listener: Hook<IL>
  ): Unlisten {
    return startListener(listener, true)
  }

  function listen<IL extends Location>(
    listener: Hook<IL>
  ): Unlisten {
    return startListener(listener, false)
  } 

  const goIsSupportedWithoutReload: boolean =
    supportsGoWithoutReloadUsingHash()

    function go(n: number): void {
    warning(
      goIsSupportedWithoutReload,
      "Hash history go(n) causes a full page reload in this browser"
    )

    history.go(n)
  }

  function createHref<BL extends BaseLocation>(location: BL | string): string {
    return "#" + pathCoder.encodePath(_createHref(location))
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

export default createHashHistory
