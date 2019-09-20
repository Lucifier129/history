import { parse, stringify } from "querystringify"
import runTransitionHook, { Hook } from "./runTransitionHook"
import {
  createQuery,
  NativeLocation,
  DraftLocation,
  BaseLocation
} from "./LocationUtils"
import { parsePath } from "./PathUtils"
import {
  CreateHistory,
  NativeHistory,
  ParseQueryString,
  GetCurrentLocation,
  HistoryOptions
} from "./type"

export interface DefaultStringifyQuery {
  (query: object): string
}

export interface UseQueries {
  (createHistory: CreateHistory): CreateHistory
}

export interface DecodeQuery {
  (location: NativeLocation): NativeLocation
}

export interface EncodeQuery {
  (location: DraftLocation | string, query: object): DraftLocation
}

export interface ListenBefore {
  (hook: Hook): any
}

export interface Listen {
  (listener: Hook): any
}

export interface Push {
  (location: DraftLocation | string): any
}

export interface Replace {
  (location: DraftLocation | string): any
}

export interface CreatePath {
  (location: DraftLocation | string): any
}

export interface CreateHref {
  (location: DraftLocation | string): any
}

export interface CreateLocation {
  (location: DraftLocation | string, ...args: any[]): NativeLocation
}

const defaultStringifyQuery: DefaultStringifyQuery = query =>
  stringify(query).replace(/%20/g, "+")

const defaultParseQueryString: ParseQueryString = parse

/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
const useQueries: UseQueries = createHistory => {
  let ch: CreateHistory = (
    options: HistoryOptions = { hashType: "slash" }
  ) => {
    const history = createHistory(options)
    let {
      stringifyQuery = defaultStringifyQuery,
      parseQueryString = defaultParseQueryString
    } = options

    const decodeQuery: DecodeQuery = location => {
      if (!location) return location

      if (location.query == null)
        location.query = parseQueryString(
          location && location.search ? location.search.substring(1) : ""
        )

      return location
    }

    const encodeQuery: EncodeQuery = (location, query) => {
      const object: BaseLocation =
        typeof location === "string" ? parsePath(location) : location
      const queryString: string = stringifyQuery(query || {})
      const search: string = queryString ? `?${queryString}` : ""
      return {
        ...object,
        search
      }
    }

    // Override all read methods with query-aware versions.
    const getCurrentLocation: GetCurrentLocation = () =>
      decodeQuery(history.getCurrentLocation())

    const listenBefore: ListenBefore = hook =>
      history.listenBefore((location, callback) =>
        runTransitionHook(hook, decodeQuery(location), callback)
      )

    const listen: Listen = listener =>
      history.listen(location => listener(decodeQuery(location)))

    // Override all write methods with query-aware versions.
    const push: Push = location =>
      history.push(
        encodeQuery(
          location,
          typeof location === "string" ? {} : location.query || {}
        )
      )

    const replace: Replace = location =>
      history.replace(
        encodeQuery(
          location,
          typeof location === "string" ? {} : location.query || {}
        )
      )

    const createPath: CreatePath = location =>
      history.createPath(
        encodeQuery(
          location,
          typeof location === "string" ? {} : location.query || {}
        )
      )

    const createHref: CreateHref = location =>
      history.createHref(
        encodeQuery(
          location,
          typeof location === "string" ? {} : location.query || {}
        )
      )

    const createLocation: CreateLocation = (location, ...args) => {
      let newLocation: DraftLocation = encodeQuery(
        location,
        typeof location === "string" ? {} : location.query || {}
      )
      let newLocationAfter: NativeLocation = history.createLocation(
        newLocation,
        ...args
      )
      if (typeof location !== "string" && location.query)
        newLocation.query = createQuery(location.query)

      return decodeQuery(newLocationAfter)
    }

    return {
      ...history,
      getCurrentLocation,
      listenBefore,
      listen,
      push,
      replace,
      createPath,
      createHref,
      createLocation
    }
  }
  return ch
}

export default useQueries
