import { loopAsync } from './AsyncUtils'
import { createPath, CreatePath } from './PathUtils'
import runTransitionHook from './runTransitionHook'
import {
  NativeLocation,
  createLocation as _createLocation,
  statesAreEqual,
  locationsAreEqual,
  DraftLocation,
  BaseLocation,
} from './LocationUtils'
import Actions, { POP, PUSH, REPLACE } from './Actions'
import { Hook } from './runTransitionHook'
import { PathCoders } from './HashProtocol'

/**
 * HistoryOptions
 */
export interface GetCurrentLocation {
  (): NativeLocation
}

export interface GetUserConfirmation {
  (message: string, callback: Function): any
}

export interface PushLocation {
  (location: NativeLocation): boolean
}

export interface ReplaceLocation {
  (location: NativeLocation): boolean
}

export interface Go {
  (n: number): void
}

export interface StringifyQuery {
  (query: object): string
}

export interface ParseQueryString {
  (query: string): object
}

export interface HistoryOptions {
  getCurrentLocation: GetCurrentLocation
  getUserConfirmation?: GetUserConfirmation
  pushLocation: PushLocation
  replaceLocation: ReplaceLocation
  go: Go
  keyLength: number
  forceRefresh: boolean
  queryKey: string
  hashType: keyof PathCoders
  basename: string
  stringifyQuery: StringifyQuery
  parseQueryString: ParseQueryString
}

/**
 * NativeHistory
 */
export interface Unlisten {
  (): void
}

export interface ListenBefore {
  (hook: Hook): Unlisten
}

export interface Listen {
  (hook: Hook): Unlisten;
}

export interface ListenBeforeUnload {
  (hook: Hook): Unlisten
}

export interface TransitionTo {
  (nextLocation: NativeLocation): void;
}

export interface Push {
  (input: DraftLocation | string): Function | void;
}

export interface Replace {
  (input: DraftLocation | string): Function | void;
}

export interface GoBack {
  (): void;
}

export interface GoForward {
  (): void;
}

export interface CreateKey {
  (): string;
}

export interface CreateHref {
  (location: BaseLocation | string): string;
}

export interface CreateLocation {
  (
    location: DraftLocation | string,
    action?: Actions,
    key?: string
  ): NativeLocation;
}

export interface NativeHistory {
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

export interface GetCurrentIndex {
  (): number;
}

export interface UpdateLocation {
  (location: NativeLocation): void;
}

export interface ConfirmTransitionTo {
  (location: NativeLocation, callback: (ok: any) => void): void;
}

export interface CreateHistory {
  (options: HistoryOptions): NativeHistory;
}

// Share
export interface StopListener {
  (): void
}

export interface StartListener {
  (listener: Hook, before: boolean): StopListener
}

const createHistory: CreateHistory = (options) => {
  const {
    getCurrentLocation,
    getUserConfirmation,
    pushLocation,
    replaceLocation,
    go,
    keyLength
  } = options

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

  const listenBefore: ListenBefore = (hook) => {
    beforeHooks.push(hook)

    return () =>
    beforeHooks = beforeHooks.filter(item => item !== hook)
  }

  const listen: Listen = (hook) => {
    hooks.push(hook)

    return () =>
      hooks = hooks.filter(item => item !== hook)
  }

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
    _createLocation(location, key, action)

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

export default createHistory
