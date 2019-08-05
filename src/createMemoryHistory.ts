/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 16:22:07 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-05 17:10:01
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

const createMemoryHistory: (options?: string | string[] | object) => NativeHistory
= (options = {}) => {
  let reFormatOptions: {
    entries?: any[],
    current?: number
  } = {}
  if (Array.isArray(options)) {
    reFormatOptions = { entries: options }
  } else if (typeof options === 'string') {
    reFormatOptions = { entries: [ options ] }
  }

  const getCurrentLocation: () => Location = () => {
    const entry: Location = entries[current]
    const path: string = createPath(entry)

    let key, state
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
        'Cannot go(%s) there is not enough history',
        n
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
    ...reFormatOptions,
    getCurrentLocation,
    pushLocation,
    replaceLocation,
    go
  })

  let entries: any[] = []
  let current: number
  if (reFormatOptions.entries !== undefined) {
    entries = reFormatOptions.entries
  }
  if (reFormatOptions.current !== undefined) {
    current = reFormatOptions.current
  }

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
