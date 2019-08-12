import warning from 'warning'
import invariant from 'invariant'
import { canUseDOM } from './ExecutionEnvironment'
import { supportsGoWithoutReloadUsingHash } from './DOMUtils'
import * as HashProtocol from './HashProtocol'
import createHistory from './createHistory'
import CH, { Location } from './index'
import { PathCoder, PathCoders } from './HashProtocol'

export type CreateHistory = CH.CreateHistory

export type GetCurrentLocation = CH.GetCurrentLocation

export type PushLocation = CH.PushLocation

export interface ReplaceLocation {
  (location: Location): void
}

export interface StartListener {
  (listener: Function, before: boolean): () => void
}

export type ListenBefore = CH.ListenBefore

export type Listen = CH.Listen

export type Go = CH.Go

export interface CreateHref {
  (path: string): string
}

const DefaultQueryKey: string = '_k'

const addLeadingSlash: (path: string) => string = (path) =>
  path.charAt(0) === '/' ? path : '/' + path

const HashPathCoders: PathCoders = {
  hashbang: {
    encodePath: (path) => path.charAt(0) === '!' ? path : '!' + path,
    decodePath: (path) => path.charAt(0) === '!' ? path.substring(1) : path
  },
  noslash: {
    encodePath: (path) => path.charAt(0) === '/' ? path.substring(1) : path,
    decodePath: addLeadingSlash
  },
  slash: {
    encodePath: addLeadingSlash,
    decodePath: addLeadingSlash
  }
}

const createHashHistory: CreateHistory = (options = {}) => {
  invariant(
    canUseDOM,
    'Hash history needs a DOM'
  )

  let { queryKey, hashType }: CH.HistoryOptions = options

  // warning(
  //   queryKey !== false,
  //   'Using { queryKey: false } no longer works. Instead, just don\'t ' +
  //   'use location state if you don\'t want a key in your URL query string'
  // )

  if (typeof queryKey !== 'string')
    queryKey = DefaultQueryKey

  if (hashType == null)
    hashType = 'slash'

  if (!(hashType in HashPathCoders)) {
    warning(
      false,
      'Invalid hash type: %s',
      hashType
    )

    hashType = 'slash'
  }

  const pathCoder: PathCoder = HashPathCoders[hashType]

  const { getUserConfirmation } = HashProtocol

  const getCurrentLocation: GetCurrentLocation = () =>
    HashProtocol.getCurrentLocation(pathCoder, queryKey)

  const pushLocation: PushLocation = (location) =>
    HashProtocol.pushLocation(location, pathCoder, queryKey)

  const replaceLocation: ReplaceLocation = (location) =>
    HashProtocol.replaceLocation(location, pathCoder, queryKey)

  const history: CH.NativeHistory = createHistory({
    getUserConfirmation, // User may override in options
    ...options,
    getCurrentLocation,
    pushLocation,
    replaceLocation,
    go: HashProtocol.go
  })

  let listenerCount: number = 0
  let stopListener: Function

  const startListener: StartListener = (listener, before) => {
    if (++listenerCount === 1)
      stopListener = HashProtocol.startListener(
        history.transitionTo,
        pathCoder,
        queryKey
      )

    const unlisten = before
      ? history.listenBefore(listener)
      : history.listen(listener)

    return () => {
      unlisten()

      if (--listenerCount === 0)
        stopListener()
    }
  }

  const listenBefore: ListenBefore = (listener) =>
    startListener(listener, true)

  const listen: Listen = (listener) =>
    startListener(listener, false)

  const goIsSupportedWithoutReload: boolean = supportsGoWithoutReloadUsingHash()

  const go: Go = (n) => {
    warning(
      goIsSupportedWithoutReload,
      'Hash history go(n) causes a full page reload in this browser'
    )

    history.go(n)
  }

  const createHref: CreateHref = (path) =>
    '#' + pathCoder.encodePath(history.createHref(path))

  return {
    ...history,
    listenBefore,
    listen,
    go,
    createHref
  }
}

export default createHashHistory
