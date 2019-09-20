import { createLocation, NativeLocation } from './LocationUtils'
import { addEventListener, removeEventListener } from './DOMUtils'
import { saveState, readState } from './DOMStateStorage'
import { createPath } from './PathUtils'
import { GetUserConfirmation, Go } from './createHistory'

export interface CreateBrowserLocation {
  (historyState: any): NativeLocation
}

export interface GetBrowserCurrentLocation {
  (): NativeLocation
}

export interface IsExtraneousPopstateEvent {
  (event: any): boolean
}

export interface StartListener {
  (listener: Function): () => void
}

export interface UpdateState {
  (state: object, path: string): void
}

export interface UpdateLocation {
  (
    location: NativeLocation,
    updateState: UpdateState
  ): void
}

export interface PushLocation {
  (location: NativeLocation): void
}

export interface ReplaceLocation {
  (location: NativeLocation): void
}

export interface PopEventListener {
  (event: PopStateEvent): void
}

const PopStateEventState = 'popstate'

const _createLocation: CreateBrowserLocation = (historyState) => {
  const key = historyState && historyState.key

  return createLocation({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: (key ? readState(key) : undefined)
  }, '', key)
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
  const handlePopState: PopEventListener = (event: PopStateEvent) => {
    if (isExtraneousPopstateEvent(event)) return // Ignore extraneous popstate events in WebKit
    listener(_createLocation(event.state))
  }

  addEventListener(window, PopStateEventState, handlePopState as EventListener)

  return () =>
    removeEventListener(window, PopStateEventState, handlePopState as EventListener)
}

const updateLocation: UpdateLocation = (location, updateState) => {
  const { state, key } = location

  if (state !== undefined) {
    saveState(key, state)
  }

  updateState({ key }, createPath(location))
}

export const pushLocation: PushLocation = (location) => {
  updateLocation(
    location, 
    (state: object, path: string) =>
      window.history.pushState(state, '', path)
  )
  return true
}
  


export const replaceLocation: ReplaceLocation = (location) => {
  updateLocation(location, (state: object, path: string) =>
    window.history.replaceState(state, '', path)
  )
  return true
}
  


export const go: Go = (n) => {
  if (n)
    window.history.go(n)
}
