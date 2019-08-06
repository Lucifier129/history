/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 16:22:07 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-05 19:42:14
 */

import warning from 'warning'
import invariant from 'invariant'
import { createLocation, Location } from './LocationUtils'
import { createPath, parsePath } from './PathUtils'
import createHistory, { NativeHistory } from './createHistory'
import { POP } from './Actions'

interface Memo {
  [propName: string]: any
}

const createStateStorage: (entries: Location[]) => Memo = (entries) =>
  entries
    .filter(entry => entry.state)
    .reduce((memo, entry) => {
      memo[entry.key] = entry.state
      return memo
    }, {})

const createMemoryHistory: (options?: any) => NativeHistory
= (options = {}) => {
  if (Array.isArray(options)) {
    options = { entries: options }
  } else if (typeof options === 'string') {
    options = { entries: [ options ] }
  }

  const getCurrentLocation: () => Location = () => {
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

  const canGo: (n: number) => boolean
  = (n) => {
    const index = current + n
    return index >= 0 && index < entries.length
  }

  const go: (n: number) => void
  = (n) => {
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

  const pushLocation: (location: Location) => void
  = (location) => {
    current += 1

    if (current < entries.length)
      entries.splice(current)

    entries.push(location)

    saveState(location.key, location.state)
  }

  const replaceLocation: (location: Location) => void
  = (location) => {
    entries[current] = location
    saveState(location.key, location.state)
  }

  const history: NativeHistory = createHistory({
    ...options,
    getCurrentLocation,
    pushLocation,
    replaceLocation,
    go
  })

  let { entries, current } = options

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
