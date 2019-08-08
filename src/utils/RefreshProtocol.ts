import { createLocation } from './LocationUtils'
import { createPath } from './PathUtils'
import {
  getUserConfirmation as _getUserConfirmation,
  go as _go
} from './BrowserProtocol'

export let getUserConfirmation = _getUserConfirmation
export let go = _go

export const getCurrentLocation: CH.Utils.Refresh.GetCurrentLocation = () =>
  createLocation(window.location)

export const pushLocation: CH.Utils.Refresh.PushLocation = (location) => {
  window.location.href = createPath(location)
  return false // Don't update location
}

export const replaceLocation: CH.Utils.Refresh.ReplaceLocation = (location) => {
  window.location.replace(createPath(location))
  return false // Don't update location
}
