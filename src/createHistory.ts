import { loopAsync } from './AsyncUtils'
import { createPath } from './PathUtils'
import runTransitionHook from './runTransitionHook'
import {
  createLocation as _createLocation,
  statesAreEqual,
  locationsAreEqual,
} from './LocationUtils'
import Actions, { POP, PUSH, REPLACE } from './Actions'
import CH, { Location } from './index'

export type GetCurrentLocation = CH.GetCurrentLocation

export type ListenBefore = CH.ListenBefore

export type Listen = CH.Listen

export type TransitionTo = CH.TransitionTo

export type Push = CH.Push

export type Replace = CH.Replace

export type Go = CH.Go

export type GoBack = CH.GoBack

export type GoForward = CH.GoForward

export type CreateKey = CH.CreateKey

export type CreatePath = CH.CreatePath

export type CreateHref = CH.CreateHref

export type CreateLocation = CH.CreateLocation

export type CreateHistory = CH.CreateHistory

export interface GetCurrentIndex {
  (): number;
}

export interface UpdateLocation {
  (location: Location): void;
}

export interface ConfirmTransitionTo {
  (location: Location, callback: (ok: any) => void): void;
}

const createHistory: CreateHistory = (options = {}) => {
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
  let beforeHooks: Function[] = []
  let hooks: Function[] = []
  let allKeys: string[] = []

  const getCurrentIndex: GetCurrentIndex = () => {
    if (pendingLocation && pendingLocation.action === Actions.POP)
      return allKeys.indexOf(pendingLocation.key)

    if (currentLocation)
      return allKeys.indexOf(currentLocation.key)

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
          getUserConfirmation(message, (ok) => callback(ok !== false))
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

  const createLocation: CreateLocation = 
    (location: Location, action: Actions, key: string = createKey()) =>
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
