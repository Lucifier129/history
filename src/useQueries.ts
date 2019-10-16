import {
  parse,
  stringify
} from "query-string"
import runTransitionHook from "./runTransitionHook"
import {
  createQuery,
  CreateLocation
} from "./LocationUtils"
import {
  parsePath,
  CreatePath
} from "./PathUtils"
import {
  CreateHistory,
  ParseQueryString,
  HistoryOptions,
  Location,
  BaseLocation,
  LocationTypeLoader,
  LocationTypeMap,
  LTFromCH,
  GetCurrentLocation,
  Listen,
  ListenBefore,
  Push,
  Replace,
  CreateHref,
  ILWithQuery
} from "./type"

export interface DefaultStringifyQuery {
  (query: object): string
}

export interface UseQueries {
  <CH extends CreateHistory<any>>(
    createHistory: CH
  ): CreateHistory<LocationTypeLoader<LTFromCH<CH>, 'QUERY'>>
}

export interface DecodeQuery<IL extends Location> {
  (location: IL): IL
}

export interface EncodeQuery<BL extends BaseLocation> {
  (location: BL | string, query: object | undefined): BL | string
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
  type IL = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'QUERY'>]['Intact']
  let ch: CreateHistory<LocationTypeLoader<LTFromCH<CH>, 'QUERY'>> = (
    options: HistoryOptions = { hashType: "slash" }
  ) => {
    const history = createHistory(options)
    let {
      stringifyQuery = defaultStringifyQuery,
      parseQueryString = defaultParseQueryString
    } = options

    if (!stringifyQuery || typeof stringifyQuery !== 'function')
      stringifyQuery = defaultStringifyQuery

    if (!parseQueryString || typeof parseQueryString !== 'function')
      parseQueryString = defaultParseQueryString

    const decodeQuery: DecodeQuery<IL> = location => {
      if (!location) return location

      if (location.query === null || location.query === undefined)
        location.query = parseQueryString(
          location.search ? location.search.substring(1) : ""
        ) as Record<string, any>

      return location
    }

    const encodeQuery: EncodeQuery<BL> = (location, query) => {
      if (!query)
        return location

      const object: BaseLocation =
        typeof location === "string" ? parsePath(location) : location
      const queryString: string = stringifyQuery(query)
      const search: string = queryString ? `?${queryString}` : ""
      return {
        ...object,
        search
      }
    }

    // Override all read methods with query-aware versions.
    const getCurrentLocation: GetCurrentLocation<IL> = () =>
      decodeQuery(history.getCurrentLocation())

    const listenBefore: ListenBefore<IL> = hook =>
      history.listenBefore((location, callback) =>
        runTransitionHook(hook, decodeQuery(location), callback)
      )

    const listen: Listen<IL> = listener =>
      history.listen(location => listener(decodeQuery(location)))

    // Override all write methods with query-aware versions.
    const push: Push<BL> = location =>
      history.push(
        encodeQuery(
          location,
          typeof location === "string" ? undefined : location.query
        )
      )

    const replace: Replace<BL> = location =>
      history.replace(
        encodeQuery(
          location,
          typeof location === "string" ? undefined : location.query
        )
      )

    const createPath: CreatePath = location =>
      history.createPath(
        encodeQuery(
          location,
          typeof location === "string" ? undefined : location.query
        )
      )

    const createHref: CreateHref<BL> = location =>
      history.createHref(
        encodeQuery(
          location,
          typeof location === "string" ? undefined : location.query
        )
      )

    const createLocation: CreateLocation<BL, IL> = (
      location = '/',
      action,
      key
    ) => {
      let newLocation = encodeQuery(
        location,
        typeof location === "string" ? undefined : location.query
      )
      let newLocationAfter: ILWithQuery = history.createLocation(
        newLocation,
        action,
        key
      )
      if (typeof location !== "string" && location.query)
        newLocationAfter.query = createQuery(location.query)

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
