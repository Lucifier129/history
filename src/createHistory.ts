import { loopAsync } from './AsyncUtils'
import { createPath } from './PathUtils'
import runTransitionHook from './runTransitionHook'
import Actions, { PUSH, REPLACE, POP } from './Actions'
import {
  createLocation as _createLocation,
  statesAreEqual,
  locationsAreEqual,
  createLocation,
  Location
} from './LocationUtils'
import { createKey } from './DOMStateStorage';

export interface GetCurrentLocationFunc {
  (): Location
}

export interface HistoryOptions {
  getCurrentLocation?: GetCurrentLocationFunc
  getUserConfirmation?: Function
  pushLocation?: Function
  replaceLocation?: Function
  go?: (delta?: number) => void
  keyLength?: number
  forceRefresh?: boolean
  queryKey?: string
  hashType?: string
  basename?: string
  stringifyQuery?: Function
  parseQueryString?: Function
}

export interface NativeHistory {
  getCurrentLocation: GetCurrentLocationFunc
  listenBefore: Function
  listen: Function
  transitionTo: Function
  push: Function
  replace: Function
  go: (delta?: number) => void
  goBack: () => void
  goForward: () => void
  createKey: typeof createKey
  createPath: typeof createPath
  createHref: Function
  createLocation: typeof createLocation
}

const createHistory: (options?: HistoryOptions) => NativeHistory
= (options = {}) => {
  const {
    getCurrentLocation,
    getUserConfirmation,
    pushLocation,
    replaceLocation,
    go,
    keyLength
  } = options

  let currentLocation: Location
  let pendingLocation: Location
  let beforeListeners: Function[] = []
  let listeners: Function[] = []
  let allKeys: string[] = []

  const getCurrentIndex: () => number = () => {
    if (pendingLocation && pendingLocation.action === POP)
      return allKeys.indexOf(pendingLocation.key)

    if (currentLocation)
      return allKeys.indexOf(currentLocation.key)

    return -1
  }

  const updateLocation: (nextLocation: Location) => void
  = (nextLocation) => {
    const currentIndex = getCurrentIndex()
    currentLocation = nextLocation

    if (currentLocation.action === PUSH) {
      allKeys = [ ...allKeys.slice(0, currentIndex + 1), currentLocation.key ]
    } else if (currentLocation.action === REPLACE) {
      allKeys[currentIndex] = currentLocation.key
    }

    listeners.forEach(listener => listener(currentLocation))
  }

  const listenBefore: (listener: Function) => () => Function[] = (listener) => {
    beforeListeners.push(listener)

    return () =>
      beforeListeners = beforeListeners.filter(item => item !== listener)
  }

  const listen: (listener: Function) => () => Function[] = (listener) => {
    listeners.push(listener)

    return () =>
      listeners = listeners.filter(item => item !== listener)
  }

  const confirmTransitionTo: (location: Location, callback: (ok: any) => void) => void
  = (location, callback) => {
    loopAsync(
      beforeListeners.length,
      (index, next, done) => {
        runTransitionHook(beforeListeners[index], location, (result) =>
          result != null ? done(result) : next()
        )
      },
      (message) => {
        if (getUserConfirmation && typeof message === 'string') {
          getUserConfirmation(message, (ok) => callback(ok !== false))
        } else {
          callback(message !== false)
        }
      }
    )
  }

  const transitionTo = (nextLocation) => {
    if (
      (currentLocation && locationsAreEqual(currentLocation, nextLocation)) ||
      (pendingLocation && locationsAreEqual(pendingLocation, nextLocation))
    )
      return // Nothing to do

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
          if (pushLocation(nextLocation) !== false)
            updateLocation(nextLocation)
        } else if (nextLocation.action === REPLACE) {
          if (replaceLocation(nextLocation) !== false)
            updateLocation(nextLocation)
        }
      } else if (currentLocation && nextLocation.action === POP) {
        const prevIndex = allKeys.indexOf(currentLocation.key)
        const nextIndex = allKeys.indexOf(nextLocation.key)

        if (prevIndex !== -1 && nextIndex !== -1)
          go(prevIndex - nextIndex) // Restore the URL
      }
    })
  }

  const push: (input: string | Location) => void = (input) =>
    transitionTo(createLocation(input, PUSH))

  const replace: (input: string | Location) => void = (input) =>
    transitionTo(createLocation(input, REPLACE))

  const goBack = () =>
    go(-1)

  const goForward = () =>
    go(1)

  const createKey = () =>
    Math.random().toString(36).substr(2, keyLength || 6)

  const createHref = (location) =>
    createPath(location)

  const createLocation: (location: string | Location, action: Actions, key?: string) => Location = (location, action, key = createKey()) =>
    _createLocation(location, action, key)

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
