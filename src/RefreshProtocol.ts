import { createLocation, NativeLocation } from './LocationUtils'
import { createPath } from './PathUtils'
import {
  getUserConfirmation as _getUserConfirmation,
  go as _go
} from './BrowserProtocol'

export interface GetCurrentLocation {
  (): NativeLocation
}

export type PushLocation = CH.PushLocation

export interface ReplaceLocation {
  (location: NativeLocation): boolean
}

export let getUserConfirmation = _getUserConfirmation
export let go = _go

export const getCurrentLocation: GetCurrentLocation = () =>
  createLocation(window.location, )

export const pushLocation: PushLocation = (location) => {
  window.location.href = createPath(location)
  return false // Don't update location
}

export const replaceLocation: ReplaceLocation = (location) => {
  window.location.replace(createPath(location))
  return false // Don't update location
}
