import { loopAsync } from './utils/AsyncUtils'
import { createPath } from './utils/PathUtils'
import runTransitionHook from './utils/runTransitionHook'
import {
  createLocation as _createLocation,
  statesAreEqual,
  locationsAreEqual,
} from './utils/LocationUtils'
import './type'

const createHistory: CH.History.CreateHistory = (options = {}) => {
  const {
    getCurrentLocation,
    getUserConfirmation,
    pushLocation,
    replaceLocation,
    go,
    keyLength
  } = options

  let currentLocation: CH.Location
  let pendingLocation: CH.Location
  let beforeListeners: Function[] = []
  let listeners: Function[] = []
  let allKeys: string[] = []

  const getCurrentIndex: CH.History.GetCurrentIndex = () => {
    if (pendingLocation && pendingLocation.action === CH.Actions.POP)
      return allKeys.indexOf(pendingLocation.key)

    if (currentLocation)
      return allKeys.indexOf(currentLocation.key)

    return -1
  }

  const updateLocation: CH.History.UpdateLocation = (nextLocation) => {
    const currentIndex = getCurrentIndex()
    currentLocation = nextLocation

    if (currentLocation.action === CH.Actions.PUSH) {
      allKeys = [ ...allKeys.slice(0, currentIndex + 1), currentLocation.key ]
    } else if (currentLocation.action === CH.Actions.REPLACE) {
      allKeys[currentIndex] = currentLocation.key
    }

    listeners.forEach(listener => listener(currentLocation))
  }

  const listenBefore: CH.History.ListenBefore = (listener) => {
    beforeListeners.push(listener)

    return () =>
      beforeListeners = beforeListeners.filter(item => item !== listener)
  }

  const listen: CH.History.Listen = (listener) => {
    listeners.push(listener)

    return () =>
      listeners = listeners.filter(item => item !== listener)
  }

  const confirmTransitionTo: CH.History.ConfirmTransitionTo = (location, callback) => {
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

  const transitionTo: CH.History.TransitionTo = (nextLocation) => {
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
        if (nextLocation.action === CH.Actions.PUSH) {
          const prevPath = createPath(currentLocation)
          const nextPath = createPath(nextLocation)

          if (nextPath === prevPath && statesAreEqual(currentLocation.state, nextLocation.state))
            nextLocation.action = CH.Actions.REPLACE
        }

        if (nextLocation.action === CH.Actions.POP) {
          updateLocation(nextLocation)
        } else if (nextLocation.action === CH.Actions.PUSH) {
          if (pushLocation(nextLocation) !== false)
            updateLocation(nextLocation)
        } else if (nextLocation.action === CH.Actions.REPLACE) {
          if (replaceLocation(nextLocation) !== false)
            updateLocation(nextLocation)
        }
      } else if (currentLocation && nextLocation.action === CH.Actions.POP) {
        const prevIndex = allKeys.indexOf(currentLocation.key)
        const nextIndex = allKeys.indexOf(nextLocation.key)

        if (prevIndex !== -1 && nextIndex !== -1)
          go(prevIndex - nextIndex) // Restore the URL
      }
    })
  }

  const push: CH.History.Push = (input) =>
    transitionTo(createLocation(input, CH.Actions.PUSH))

  const replace: CH.History.Replace = (input) =>
    transitionTo(createLocation(input, CH.Actions.REPLACE))

  const goBack: CH.History.GoBack = () =>
    go(-1)

  const goForward: CH.History.GoForward = () =>
    go(1)

  const createKey: CH.History.CreateKey = () =>
    Math.random().toString(36).substr(2, keyLength || 6)

  const createHref: CH.History.CreateHref = (location) =>
    createPath(location)

  const createLocation: CH.History.CreateLocation = 
    (location: Location, action: CH.Actions, key: string = createKey()) =>
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
