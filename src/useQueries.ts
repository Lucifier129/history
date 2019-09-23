import { parse, stringify } from "querystringify"
import runTransitionHook, { Callback } from "./runTransitionHook"
import {
  createQuery,
  CreateLocation
} from "./LocationUtils"
import { parsePath, CreatePath } from "./PathUtils"
import {
  CreateHistory,
  ParseQueryString,
  HistoryOptions,
  NativeLocation,
  BaseLocation,
  LocationTypeLoader,
  LocationTypeMap,
  LTFromCH,
  GetCurrentLocation,
  Listen,
  ListenBefore,
  Push,
  Replace,
  CreateHref
} from "./type"

export type WithQuery<L extends BaseLocation> = L & {
  query?: object
}

export interface DefaultStringifyQuery {
  (query: object): string
}

export interface UseQueries {
  <CH extends CreateHistory<any>>(createHistory: CH): CreateHistory<LocationTypeLoader<LTFromCH<CH>, 'QUERY'>>
}

export interface DecodeQuery<NL extends NativeLocation> {
  (location: NL): NL
}

export interface EncodeQuery<BL extends BaseLocation> {
  (location: BL | string, query: object): BL
}

const defaultStringifyQuery: DefaultStringifyQuery = query =>
  stringify(query).replace(/%20/g, "+")

const defaultParseQueryString: ParseQueryString = parse

/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
const useQueries: UseQueries = <CH extends CreateHistory<any>>(createHistory: CH) => {
  type BL = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'QUERY'>]['Base']
  type NL = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'QUERY'>]['Native']
  let ch: CreateHistory<LocationTypeLoader<LTFromCH<CH>, 'QUERY'>> = (
    options: HistoryOptions = { hashType: "slash" }
  ) => {
    const history = createHistory(options)
    let {
      stringifyQuery = defaultStringifyQuery,
      parseQueryString = defaultParseQueryString
    } = options

    const decodeQuery: DecodeQuery<NL> = location => {
      if (!location) return location

      if (location.query === null || location.query === undefined)
        location.query = parseQueryString(
          location && location.search ? location.search.substring(1) : ""
        )

      return location
    }

    const encodeQuery: EncodeQuery<BL> = (location, query) => {
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
    const getCurrentLocation: GetCurrentLocation<NL> = () =>
      decodeQuery(history.getCurrentLocation())

    const listenBefore: ListenBefore<NL> = hook =>
      history.listenBefore((location, callback) =>
        runTransitionHook(hook, decodeQuery(location), callback)
      )

    const listen: Listen<NL> = listener =>
      history.listen(location => listener(decodeQuery(location)))

    // Override all write methods with query-aware versions.
    const push: Push<BL> = location =>
      history.push(
        encodeQuery(
          location,
          typeof location === "string" ? {} : location.query || {}
        )
      )

    const replace: Replace<BL> = location =>
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

    const createHref: CreateHref<BL> = location =>
      history.createHref(
        encodeQuery(
          location,
          typeof location === "string" ? {} : location.query || {}
        )
      )

    const createLocation: CreateLocation<BL, NL> = (location, ...args) => {
      let newLocation = encodeQuery(
        location || {},
        typeof location === "string" ? {} : (location && location.query) || {}
      )
      let newLocationAfter: NativeLocation = history.createLocation(
        newLocation,
        ...args
      )
      if (typeof location !== "string" && ((location && location.query) || {}))
        newLocation.query = createQuery((location && location.query) || {})

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
