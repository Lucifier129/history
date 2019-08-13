import { createLocation } from './LocationUtils'
import { addEventListener, removeEventListener } from './DOMUtils'
import { saveState, readState } from './DOMStateStorage'
import { createPath } from './PathUtils'
import CH, { Location } from './index'

export interface CreateBrowserLocation {
  (historyState: any): Location;
}

export interface GetBrowserCurrentLocation {
  (): Location;
}
export type GetUserConfirmation = CH.GetUserConfirmation
export interface IsExtraneousPopstateEvent {
  (event: any): boolean;
}
export interface StartListener {
  (listener: Function): () => void;
}

export interface UpdateState {
  (locationKey: Location, location: Location | string): void;
}

export interface UpdateLocation {
  (
    location: Location,
    updateState?: UpdateState
  ): void;
}

export type PushLocation = CH.PushLocation

export type ReplaceLocation = CH.ReplaceLocation

export type Go = CH.Go

const PopStateEvent = 'popstate'

const _createLocation: CreateBrowserLocation = (historyState) => {
  const key = historyState && historyState.key

  return createLocation({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: (key ? readState(key) : undefined)
  }, undefined, key)
}


export const getCurrentLocation: GetBrowserCurrentLocation = () => {
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


export const getUserConfirmation: GetUserConfirmation
  = (message, callback) => callback(window.confirm(message)) // eslint-disable-line no-alert


const isExtraneousPopstateEvent: IsExtraneousPopstateEvent
  = event => event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1


export const startListener: StartListener = (listener) => {
  const handlePopState = (event) => {
    if (isExtraneousPopstateEvent(event)) return // Ignore extraneous popstate events in WebKit
    listener(_createLocation(event.state))
  }

  addEventListener(window, PopStateEvent, handlePopState)

  return () =>
    removeEventListener(window, PopStateEvent, handlePopState)
}

const updateLocation: UpdateLocation = (location, updateState) => {
  const { state, key } = location

  if (state !== undefined)
    saveState(key, state)

  updateState({ key }, createPath(location))
}

export const pushLocation: PushLocation = (location) =>
  updateLocation(
    location, 
    (state: object, path: string) =>
      window.history.pushState(state, null, path)
  )


export const replaceLocation: ReplaceLocation = (location) =>
  updateLocation(location, (state: object, path: string) =>
    window.history.replaceState(state, null, path)
  )


export const go: Go = (n) => {
  if (n)
    window.history.go(n)
}
