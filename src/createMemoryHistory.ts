import warning from 'warning'
import invariant from 'invariant'
import { createLocation } from './LocationUtils'
import { createPath, parsePath } from './PathUtils'
import createHistory from './createHistory'
import { POP } from './Actions'
import CH, { Location } from './index'

export interface Memo {
  [propName: string]: any
}

export interface MemoryOptions extends CH.HistoryOptions {
  entries?: any
  current?: number
}

export interface CreateStateStorage {
  (entries: Location[]): Memo
}

export type CreateHistory = CH.CreateHistory

export type GetCurrentLocation = CH.GetCurrentLocation

export interface CanGo {
  (n: number): boolean
}

export type Go = CH.Go

export type PushLocation = CH.PushLocation

export type ReplaceLocation = CH.ReplaceLocation

const createStateStorage: CreateStateStorage = (entries) =>
  entries
    .filter(entry => entry.state)
    .reduce((memo, entry) => {
      memo[entry.key] = entry.state
      return memo
    }, {})

const createMemoryHistory: CreateHistory = (options = {}) => {
  let reFormatOptions: MemoryOptions = Object.assign({}, options)
  if (Array.isArray(reFormatOptions)) {
    reFormatOptions = { entries: options }
  } else if (typeof options === 'string') {
    reFormatOptions = { entries: [ options ] }
  }

  const getCurrentLocation: GetCurrentLocation = () => {
    const entry: Location = entries[current]
    const path: string = createPath(entry)

    let key: string
    let state: any
    if (entry && entry.key) {
      key = entry.key
      state = readState(key)
    }

    const init: Location = parsePath(path)

    return createLocation({ ...init, state }, undefined, key)
  }

  const canGo: CanGo = (n) => {
    const index = current + n
    return index >= 0 && index < entries.length
  }

  const go: Go = (n) => {
    if (!n)
      return

    if (!canGo(n)) {
      warning(
        false,
        'Cannot go(%s) there is not enough history when current is %s and entries length is %s',
        n, current, entries.length
      )

      return
    }

    current += n
    const currentLocation = getCurrentLocation()

    // Change action to POP
    history.transitionTo({ ...currentLocation, action: POP })
  }

  const pushLocation: PushLocation = (location) => {
    current += 1

    if (current < entries.length)
      entries.splice(current)

    entries.push(location)

    saveState(location.key, location.state)
  }

  const replaceLocation: ReplaceLocation = (location) => {
    entries[current] = location
    saveState(location.key, location.state)
  }

  const history: CH.NativeHistory = createHistory({
    ...reFormatOptions,
    getCurrentLocation,
    pushLocation,
    replaceLocation,
    go
  })

  let { entries, current } = reFormatOptions

  if (typeof entries === 'string') {
    entries = [ entries ]
  } else if (!Array.isArray(entries)) {
    entries = [ '/' ]
  }

  entries = entries.map(entry => createLocation(entry))

  if (current == null) {
    current = entries.length - 1
  } else {
    invariant(
      current >= 0 && current < entries.length,
      'Current index must be >= 0 and < %s, was %s',
      entries.length, current
    )
  }

  const storage: Memo = createStateStorage(entries)

  const saveState: (key: string, state: any) => any = (key, state) =>
    storage[key] = state

  const readState: (key: string) => any = (key) =>
    storage[key]

  return history
}

export default createMemoryHistory
