import Utils from './type'

import { createLocation } from './LocationUtils'
import { addEventListener, removeEventListener } from './DOMUtils'
import { saveState, readState } from './DOMStateStorage'
import { createPath } from './PathUtils'

const PopStateEvent = 'popstate'

const _createLocation: Utils.Browser.CreateBrowserLocation = (historyState) => {
  const key = historyState && historyState.key

  return createLocation({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: (key ? readState(key) : undefined)
  }, undefined, key)
}

export const getCurrentLocation: Utils.Browser.GetBrowserCurrentLocation = () => {
  let historyState: any
  try {
    historyState = window.history.state || {}
  } catch (error) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    historyState = {}
  }

  return _createLocation(historyState)
}

export const getUserConfirmation: Utils.Browser.GetUserConfirmation
  = (message, callback) => callback(window.confirm(message)) // eslint-disable-line no-alert

const isExtraneousPopstateEvent: Utils.Browser.IsExtraneousPopstateEvent
  = event => event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1

export const startListener: Utils.Browser.StartListener = (listener) => {
  const handlePopState = (event) => {
    if (isExtraneousPopstateEvent(event)) return // Ignore extraneous popstate events in WebKit
    listener(_createLocation(event.state))
  }

  addEventListener(window, PopStateEvent, handlePopState)

  return () =>
    removeEventListener(window, PopStateEvent, handlePopState)
}

const updateLocation: Utils.Browser.UpdateLocation = (location, updateState) => {
  const { state, key } = location

  if (state !== undefined)
    saveState(key, state)

  updateState({ key }, createPath(location))
}

export const pushLocation: Utils.Browser.PushLocation = (location) =>
  updateLocation(
    location, 
    (state: object, path: string) =>
      window.history.pushState(state, null, path)
  )

export const replaceLocation: Utils.Browser.ReplaceLocation = (location) =>
  updateLocation(location, (state: object, path: string) =>
    window.history.replaceState(state, null, path)
  )

export const go: Utils.Browser.Go = (n) => {
  if (n)
    window.history.go(n)
}
