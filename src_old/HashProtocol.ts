import warning from 'warning'
import { createLocation, NativeLocation, DraftLocation } from './LocationUtils'
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

export interface PathCoder {
  encodePath: (path: string) => string;
  decodePath: (path: string) => string;
}

export interface PathCoders {
  hashbang: PathCoder;
  noslash: PathCoder;
  slash: PathCoder;
}

export interface GetPath {
  (): string;
}

export interface PushPath {
  (path: string): string;
}

export interface ReplacePath {
  (path: string): void;
}

export interface PopEventListener {
  (event: PopStateEvent): void
}

export interface StopListener {
  (): void
}

export interface StartListener {
  (
    listener: Function,
    pathCoder: PathCoder,
    queryKey: string
  ): StopListener;
}

export interface Update {
  (path: string): void;
}

export interface UpdateLocation {
  (
    location: NativeLocation,
    pathCoder: PathCoder,
    queryKey: string,
    updateHash: Update
  ): void;
}

export interface GetCurrentLocation {
  (pathCoder: PathCoder, queryKey: string): NativeLocation
}


export interface PushLocation {
  (location: NativeLocation, pathCoder: PathCoder, queryKey: string): void
}

export interface ReplaceLocation {
  (location: NativeLocation, pathCoder: PathCoder, queryKey: string): void
}

export let getUserConfirmation = _getUserConfirmation
export let go = _go

const HashChangeEvent: string = 'hashchange'

const getHashPath: GetPath = () => {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  const href: string = window.location.href
  const hashIndex: number = href.indexOf('#')
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1)
}

const pushHashPath: PushPath = (path) =>
  window.location.hash = path

const replaceHashPath: ReplacePath = (path) => {
  const hashIndex: number = window.location.href.indexOf('#')

  window.location.replace(
    window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path
  )
}

export const getCurrentLocation: GetCurrentLocation = (pathCoder: PathCoder, queryKey: string) => {
  let path: string = pathCoder.decodePath(getHashPath())
  const key: string = getQueryStringValueFromPath(path, queryKey)

  let state
  if (key) {
    path = stripQueryStringValueFromPath(path, queryKey)
    state = readState(key)
  }

  const init = parsePath(path)
  let newInit: DraftLocation = Object.assign(init, { state })

  return createLocation(newInit, key)
}

let prevLocation: NativeLocation

export const startListener: StartListener = (listener, pathCoder, queryKey) => {
  const handleHashChange: PopEventListener = () => {
    const path: string = getHashPath()
    const encodedPath: string = pathCoder.encodePath(path)

    if (path !== encodedPath) {
      // Always be sure we have a properly-encoded hash.
      replaceHashPath(encodedPath)
    } else {
      const currentLocation: NativeLocation = getCurrentLocation(pathCoder, queryKey)

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

  addEventListener(window, HashChangeEvent, handleHashChange as EventListener)

  return () =>
    removeEventListener(window, HashChangeEvent, handleHashChange as EventListener)
}

const updateLocation: UpdateLocation = (location, pathCoder, queryKey, updateHash) => {
  const { state, key } = location

  let path: string = pathCoder.encodePath(createPath(location))

  if (state !== undefined) {
    path = addQueryStringValueToPath(path, queryKey, key)
    saveState(key, state)
  }

  prevLocation = location

  updateHash(path)
}

export const pushLocation: PushLocation = (location: NativeLocation, pathCoder: PathCoder, queryKey: string) =>
  updateLocation(location, pathCoder, queryKey, (path) => {
    if (getHashPath() !== path) {
      pushHashPath(path)
    } else {
      warning(false, 'You cannot PUSH the same path using hash history')
    }
  })

export const replaceLocation: ReplaceLocation = (location: NativeLocation, pathCoder: PathCoder, queryKey: string) =>
  updateLocation(location, pathCoder, queryKey, (path) => {
    if (getHashPath() !== path)
      replaceHashPath(path)
  })
