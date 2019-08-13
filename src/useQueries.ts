import { parse, stringify } from 'querystringify'
import runTransitionHook from './runTransitionHook'
import { createQuery } from './LocationUtils'
import { parsePath } from './PathUtils'
import CH, { Location } from './index'

export interface DefaultStringifyQuery {
  (query: object): string
}

export interface UseQueries {
  (createHistory: CH.CreateHistory): CH.CreateHistory
}

export interface DecodeQuery {
  (location: Location): Location
}

export interface EncodeQuery {
  (location: Location, query: object): Location
}

export interface GetCurrentLocation {
  (): Location
}

export interface ListenBefore {
  (hook: Function): any
}

export interface Listen {
  (listener: Function): any
}

export interface Push {
  (location: Location): any
}

export interface Replace {
  (location: Location): any
}

export interface CreatePath {
  (location: Location): any
}

export interface CreateHref {
  (location: Location): any
}

export interface CreateLocation {
  (location: Location, ...args: any[]): Location
}

const defaultStringifyQuery: DefaultStringifyQuery = (query) =>
  stringify(query).replace(/%20/g, '+')

const defaultParseQueryString: CH.ParseQueryString = parse

/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
const useQueries: UseQueries = (createHistory) =>
  (options: CH.HistoryOptions = {}) => {
    const history: CH.NativeHistory = createHistory(options)
    let { stringifyQuery, parseQueryString } = options

    if (typeof stringifyQuery !== 'function')
      stringifyQuery = defaultStringifyQuery

    if (typeof parseQueryString !== 'function')
      parseQueryString = defaultParseQueryString

    const decodeQuery: DecodeQuery = (location) => {
      if (!location)
        return location

      if (location.query == null)
        location.query = parseQueryString(location.search.substring(1))

      return location
    }

    const encodeQuery: EncodeQuery = (location, query) => {
      if (query == null)
        return location
      const object: Location = typeof location === 'string' ? parsePath(location) : location
      let newQuery = {}
      for (let k in query) {
        if (query[k]) {
          newQuery[k] = query[k]
        }
      }
      const queryString: string = stringifyQuery(newQuery)
      const search: string = queryString ? `?${queryString}` : ''
      return {
        ...object,
        search
      }
    }

    // Override all read methods with query-aware versions.
    const getCurrentLocation: GetCurrentLocation = () =>
      decodeQuery(history.getCurrentLocation())

    const listenBefore: ListenBefore = (hook) =>
      history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, decodeQuery(location), callback)
      )

    const listen: Listen = (listener) =>
      history.listen(location => listener(decodeQuery(location)))

    // Override all write methods with query-aware versions.
    const push: Push = (location) =>
      history.push(encodeQuery(location, location.query))

    const replace: Replace = (location) =>
      history.replace(encodeQuery(location, location.query))

    const createPath: CreatePath = (location) =>
      history.createPath(encodeQuery(location, location.query))

    const createHref: CreateHref = (location) =>
      history.createHref(encodeQuery(location, location.query))

    const createLocation: CreateLocation = (location, ...args) => {
      let newLocation: Location = encodeQuery(location, location.query)
      newLocation = history.createLocation(newLocation, ...args)
      if (location.query)
        newLocation.query = createQuery(location.query)

      return decodeQuery(newLocation)
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

export default useQueries
