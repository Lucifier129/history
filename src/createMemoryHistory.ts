import warning from "warning"
import invariant from "invariant"
import { loopAsync } from './AsyncUtils'
import {
  createPath,
  parsePath
} from './PathUtils'
import { Hook } from "./runTransitionHook"
import {
  CreateKey,
  CreateLocation,
  createLocation as _createLocation,
  statesAreEqual,
  locationsAreEqual,
  defaultGetUserConfirmation
} from './LocationUtils'
import {
  ReadState,
  SaveState
} from './DOMStateStorage'
import Actions, {
  POP,
  PUSH,
  REPLACE
} from './Actions'
import runTransitionHook from './runTransitionHook'
import {
  Location,
  BaseLocation,
  GetUserConfirmation,
  GetCurrentLocation,
  Listen,
  ListenBefore,
  TransitionTo,
  Push,
  Replace,
  Go,
  GoBack,
  GoForward,
  CreateHref,
  CreateHistory
} from './type'

/**
 * Utils
 */
/**
 * Base
 */
export interface GetCurrentIndex {
  (): number;
}

export interface UpdateLocation {
  (location: Location): void;
}

export interface ConfirmTransitionTo {
  (location: Location, callback: (ok: any) => void): void;
}

export interface PushLocation {
  (location: Location): boolean
}

export interface ReplaceLocation {
  (location: Location): boolean
}

export interface Memo {
  [propName: string]: any
}

export interface Entry {
  key: string,
  state: any
}

export interface CreateStateStorage {
  (entries: Location[]): Memo
}

export interface CanGo {
  (n: number): boolean
}

/**
 * Memory
 */

const createStateStorage: CreateStateStorage = entries =>
  entries
    .filter(entry => entry.state)
    .reduce((memo, entry) => {
      memo[entry.key] = entry.state
      return memo
    }, {} as Memo)

const createMemoryHistory: CreateHistory<'NORMAL'> = (
  options = { hashType: 'slash' }
) => {
  const getUserConfirmation: GetUserConfirmation =
    options.getUserConfirmation || defaultGetUserConfirmation

  let currentLocation: Location
  let pendingLocation: Location | null
  let beforeHooks: Hook[] = []
  let hooks: Hook[] = []
  let allKeys: string[] = []

  const getCurrentIndex: GetCurrentIndex = () => {
    if (pendingLocation && pendingLocation.action === Actions.POP)
      return allKeys.indexOf(pendingLocation.key || '')

    if (currentLocation)
      return allKeys.indexOf(currentLocation.key || '')

    return -1
  }

  const updateLocation: UpdateLocation = (nextLocation) => {
    const currentIndex = getCurrentIndex()
    currentLocation = nextLocation

    if (currentLocation.action === PUSH) {
      allKeys = [ ...allKeys.slice(0, currentIndex + 1), currentLocation.key]
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

  const confirmTransitionTo: ConfirmTransitionTo = (
    location,
    callback
  ) => {
    loopAsync(
      beforeHooks.length,
      (index, next, done) => {
        runTransitionHook(beforeHooks[index], location, (result) =>
          result != null ? done(result) : next()
        )
      },
      (message) => {
        if (getUserConfirmation && typeof message === 'string') {
          getUserConfirmation(message, (ok: boolean) => callback(ok !== false))
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
    ) {
      return // Nothing to do
    }

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

          if (
            nextPath === prevPath
            && statesAreEqual(currentLocation.state, nextLocation.state)
          ) {
            nextLocation.action = REPLACE
          }
        }

        if (nextLocation.action === POP) {
          updateLocation(nextLocation)
        } else if (nextLocation.action === PUSH) {
          if (pushLocation(nextLocation) !== false) {
            updateLocation(nextLocation)
          }
        } else if (nextLocation.action === REPLACE) {
          if (replaceLocation(nextLocation) !== false) {
            updateLocation(nextLocation)
          }
        }
      } else if (currentLocation && nextLocation.action === POP) {
        const prevIndex = allKeys.indexOf(currentLocation.key)
        const nextIndex = allKeys.indexOf(nextLocation.key)

        if (prevIndex !== -1 && nextIndex !== -1) {
          go(prevIndex - nextIndex) // Restore the URL
        }
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
    Math.random().toString(36).substr(2, 6)

  const createHref: CreateHref = (location) =>
    createPath(location)

  const createLocation: CreateLocation = (
    location,
    action,
    key = createKey()
  ) => _createLocation(location, action, key)

  const getCurrentLocation: GetCurrentLocation = () => {
    if (typeof entries[current] !== undefined) {
      const entry: Location = entries[current]
      const path: string = createPath(entry)

      let key: string = ""
      let state: any = undefined
      if (entry && entry.key) {
        key = entry.key
        state = readState(key)
      }
  
      const init: BaseLocation = parsePath(path)
  
      return _createLocation({ ...init, state }, undefined, key)
    } else {
      throw new Error('current location is not exist.')      
    }
  }

  const canGo: CanGo = n => {
    const index = current + n
    return index >= 0 && index < entries.length
  }

  const go: Go = n => {
    if (!n) return

    if (!canGo(n)) {
      warning(
        false,
        "Cannot go(%s) there is not enough history when current is %s and entries length is %s",
        n,
        current,
        entries.length
      )

      return
    }

    current += n
    const currentLocation = getCurrentLocation()

    // Change action to POP
    transitionTo({ ...currentLocation, action: POP })
  }

  const pushLocation: PushLocation = location => {
    current += 1

    if (current < entries.length) entries.splice(current)

    entries.push(location)

    saveState(location.key, location.state)
    return true
  }

  const replaceLocation: ReplaceLocation = location => {
    entries[current] = location
    saveState(location.key, location.state)
    return true
  }

  let entriesBefore: (string | Location | BaseLocation)[]

  if (typeof options.entries === "string") {
    entriesBefore = [options.entries]
  } else if (!Array.isArray(options.entries)) {
    entriesBefore = ['/']
  } else {
    entriesBefore = options.entries
  }

  let entries = entriesBefore.map(entry => _createLocation(entry))

  let current = options.current || entries.length - 1

  invariant(
    current >= 0 && current < entries.length,
    "Current index must be >= 0 and < %s, was %s",
    entries.length,
    current
  )

  const storage: Memo = createStateStorage(entries)

  const saveState: SaveState = (key, state) => (storage[key] = state)

  const readState: ReadState = key => storage[key]

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

export default createMemoryHistory
