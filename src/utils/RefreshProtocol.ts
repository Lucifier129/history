/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 15:12:31 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-02 15:19:53
 */

import { createLocation, Location } from './LocationUtils'
import { createPath } from './PathUtils'
import {
  getUserConfirmation as _getUserConfirmation,
  go as _go
} from './BrowserProtocol'

export let getUserConfirmation = _getUserConfirmation
export let go = _go

export const getCurrentLocation: () => Location
= () =>
  createLocation(window.location)

export const pushLocation: (location: Location) => boolean
= (location) => {
  window.location.href = createPath(location)
  return false // Don't update location
}

export const replaceLocation: (location: Location) => boolean
= (location) => {
  window.location.replace(createPath(location))
  return false // Don't update location
}
