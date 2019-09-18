import warning from "warning"
import invariant from "invariant"
import { canUseDOM } from "./ExecutionEnvironment"
import { supportsGoWithoutReloadUsingHash } from "./DOMUtils"
import * as HashProtocol from "./HashProtocol"
import createHistory, {
  CreateHistory,
  HistoryOptions,
  NativeHistory,
  GetCurrentLocation,
  StartListener,
  ListenBefore,
  Listen,
  Go,
  CreateHref as BaseCreateHref,
  PushLocation as BasePushLocation,
  ReplaceLocation as BaseReplaceLocation
} from "./createHistory"
import {
  PathCoder,
  PathCoders,
  PushLocation,
  ReplaceLocation
} from "./HashProtocol"
import { Hook } from "./runTransitionHook"

export interface StartListener {
  (listener: Hook, before: boolean): () => void
}

export interface CreateHref {
  (path: string): string
}

const DefaultQueryKey: string = "_k"

const addLeadingSlash: (path: string) => string = path =>
  path.charAt(0) === "/" ? path : "/" + path

const HashPathCoders: PathCoders = {
  hashbang: {
    encodePath: path => (path.charAt(0) === "!" ? path : "!" + path),
    decodePath: path => (path.charAt(0) === "!" ? path.substring(1) : path)
  },
  noslash: {
    encodePath: path => (path.charAt(0) === "/" ? path.substring(1) : path),
    decodePath: addLeadingSlash
  },
  slash: {
    encodePath: addLeadingSlash,
    decodePath: addLeadingSlash
  }
}

const createHashHistory: CreateHistory = options => {
  invariant(canUseDOM, "Hash history needs a DOM")

  let { queryKey, hashType }: HistoryOptions = options

  // warning(
  //   queryKey !== false,
  //   'Using { queryKey: false } no longer works. Instead, just don\'t ' +
  //   'use location state if you don\'t want a key in your URL query string'
  // )

  if (typeof queryKey !== "string") queryKey = DefaultQueryKey

  if (hashType == null) hashType = "slash"

  if (!(hashType in HashPathCoders)) {
    warning(false, "Invalid hash type: %s", hashType)

    hashType = "slash"
  }

  const pathCoder: PathCoder = HashPathCoders[hashType]

  const { getUserConfirmation } = HashProtocol

  const getCurrentLocation: GetCurrentLocation = () =>
    HashProtocol.getCurrentLocation(pathCoder, queryKey)

  const pushLocation: PushLocation = location =>
    HashProtocol.pushLocation(location, pathCoder, queryKey)

  const replaceLocation: ReplaceLocation = location =>
    HashProtocol.replaceLocation(location, pathCoder, queryKey)

  const history: NativeHistory = createHistory({
    getUserConfirmation, // User may override in options
    ...options,
    getCurrentLocation,
    pushLocation: pushLocation as BasePushLocation,
    replaceLocation: replaceLocation as BaseReplaceLocation,
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

      if (--listenerCount === 0) stopListener()
    }
  }

  const listenBefore: ListenBefore = listener => startListener(listener, true)

  const listen: Listen = listener => startListener(listener, false)

  const goIsSupportedWithoutReload: boolean = supportsGoWithoutReloadUsingHash()

  const go: Go = n => {
    warning(
      goIsSupportedWithoutReload,
      "Hash history go(n) causes a full page reload in this browser"
    )

    history.go(n)
  }

  const createHref: CreateHref = path =>
    "#" + pathCoder.encodePath(history.createHref(path))

  return {
    ...history,
    listenBefore,
    listen,
    go,
    createHref: createHref as BaseCreateHref
  }
}

export default createHashHistory
