/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 15:54:35 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-05 15:54:23
 */
import warning from 'warning'
import invariant from 'invariant'
import { canUseDOM } from './utils/ExecutionEnvironment'
import { supportsGoWithoutReloadUsingHash } from './utils/DOMUtils'
import * as HashProtocol from './utils/HashProtocol'
import createHistory from './createHistory'
import './type'

const DefaultQueryKey: string = '_k'

const addLeadingSlash: (path: string) => string = (path) =>
  path.charAt(0) === '/' ? path : '/' + path

const HashPathCoders: CH.PathCoders = {
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

const createHashHistory: CH.Hash.CreateHistory = (options = {}) => {
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

  const pathCoder: CH.PathCoder = HashPathCoders[hashType]

  const { getUserConfirmation } = HashProtocol

  const getCurrentLocation: CH.Hash.GetCurrentLocation = () =>
    HashProtocol.getCurrentLocation(pathCoder, queryKey)

  const pushLocation: CH.Hash.PushLocation = (location) =>
    HashProtocol.pushLocation(location, pathCoder, queryKey)

  const replaceLocation: CH.Hash.ReplaceLocation = (location) =>
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

  const startListener: CH.Hash.StartListener = (listener, before) => {
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

  const listenBefore: CH.Hash.ListenBefore = (listener) =>
    startListener(listener, true)

  const listen: CH.Hash.Listen = (listener) =>
    startListener(listener, false)

  const goIsSupportedWithoutReload: boolean = supportsGoWithoutReloadUsingHash()

  const go: CH.Hash.Go = (n) => {
    warning(
      goIsSupportedWithoutReload,
      'Hash history go(n) causes a full page reload in this browser'
    )

    history.go(n)
  }

  const createHref: CH.Hash.CreateHref = (path) =>
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
