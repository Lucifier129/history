import warning from 'warning'
import { createLocation } from './LocationUtils'
import { addEventListener, removeEventListener } from './DOMUtils'
import { saveState, readState } from './DOMStateStorage'
import {
  addQueryStringValueToPath,
  stripQueryStringValueFromPath,
  getQueryStringValueFromPath,
  parsePath,
  createPath
} from './PathUtils'
import {
  getUserConfirmation as _getUserConfirmation,
  go as _go
} from './BrowserProtocol'
import { Utils } from './index'

export let getUserConfirmation = _getUserConfirmation
export let go = _go

const HashChangeEvent: string = 'hashchange'

const getHashPath: Utils.Hash.GetPath = () => {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  const href: string = window.location.href
  const hashIndex: number = href.indexOf('#')
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1)
}

const pushHashPath: Utils.Hash.PushPath = (path) =>
  window.location.hash = path

const replaceHashPath: Utils.Hash.ReplacePath = (path) => {
  const hashIndex: number = window.location.href.indexOf('#')

  window.location.replace(
    window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path
  )
}

export const getCurrentLocation: Utils.Hash.GetCurrentLocation = (pathCoder, queryKey) => {
  let path: string = pathCoder.decodePath(getHashPath())
  const key: string = getQueryStringValueFromPath(path, queryKey)

  let state
  if (key) {
    path = stripQueryStringValueFromPath(path, queryKey)
    state = readState(key)
  }

  const init: Utils.Location = parsePath(path)
  init.state = state

  return createLocation(init, undefined, key)
}

let prevLocation: Utils.Location

export const startListener: Utils.Hash.StartListener = (listener, pathCoder, queryKey) => {
  const handleHashChange: Utils.Hash.HandleChange = () => {
    const path: string = getHashPath()
    const encodedPath: string = pathCoder.encodePath(path)

    if (path !== encodedPath) {
      // Always be sure we have a properly-encoded hash.
      replaceHashPath(encodedPath)
    } else {
      const currentLocation: Utils.Location = getCurrentLocation(pathCoder, queryKey)

      // Ignore extraneous hashchange events
      if (prevLocation) {
        if (currentLocation.key && prevLocation.key === currentLocation.key) {
          return
        }

        let curPath: string = currentLocation.pathname + currentLocation.search
        let prevPath: string = prevLocation.pathname + prevLocation.search

        // prepend basename if existed
        if (prevLocation.basename) {
          prevPath = prevLocation.basename + prevPath
        }
        
        if (prevPath === curPath) {
          return
        }
      }

      prevLocation = currentLocation

      listener(currentLocation)
    }
  }

  // Ensure the hash is encoded properly.
  const path: string = getHashPath()
  const encodedPath: string = pathCoder.encodePath(path)

  if (path !== encodedPath)
    replaceHashPath(encodedPath)

  addEventListener(window, HashChangeEvent, handleHashChange)

  return () =>
    removeEventListener(window, HashChangeEvent, handleHashChange)
}

const updateLocation: Utils.Hash.UpdateLocation = (location, pathCoder, queryKey, updateHash) => {
  const { state, key } = location

  let path: string = pathCoder.encodePath(createPath(location))

  if (state !== undefined) {
    path = addQueryStringValueToPath(path, queryKey, key)
    saveState(key, state)
  }

  prevLocation = location

  updateHash(path)
}

export const pushLocation: Utils.Hash.PushLocation = (location, pathCoder, queryKey) =>
  updateLocation(location, pathCoder, queryKey, (path) => {
    if (getHashPath() !== path) {
      pushHashPath(path)
    } else {
      warning(false, 'You cannot PUSH the same path using hash history')
    }
  })

export const replaceLocation: Utils.Hash.ReplaceLocation = (location, pathCoder, queryKey) =>
  updateLocation(location, pathCoder, queryKey, (path) => {
    if (getHashPath() !== path)
      replaceHashPath(path)
  })
