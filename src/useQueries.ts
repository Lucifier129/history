import { parse, stringify } from 'query-string'
import runTransitionHook from './utils/runTransitionHook'
import { createQuery } from './utils/LocationUtils'
import { parsePath } from './utils/PathUtils'
import CH, { HistoryOptions, NativeHistory } from './createHistory';
import { Location } from './utils/LocationUtils'

const defaultStringifyQuery: (query: object) => string = (query) =>
  stringify(query).replace(/%20/g, '+')

const defaultParseQueryString: Function = parse

/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
const useQueries: (createHistory: typeof CH) => (options?: HistoryOptions) => NativeHistory
= (createHistory) =>
  (options = {}) => {
    const history: NativeHistory = createHistory(options)
    let { stringifyQuery, parseQueryString } = options

    if (typeof stringifyQuery !== 'function')
      stringifyQuery = defaultStringifyQuery

    if (typeof parseQueryString !== 'function')
      parseQueryString = defaultParseQueryString

    const decodeQuery: (location: Location) => Location
    = (location) => {
      if (!location)
        return location

      if (location.query == null)
        location.query = parseQueryString(location.search.substring(1))

      return location
    }

    const encodeQuery: (location: Location, query: object) => Location
    = (location, query) => {
      if (query == null)
        return location

      const object: Location = typeof location === 'string' ? parsePath(location) : location
      const queryString: string = stringifyQuery(query)
      const search: string = queryString ? `?${queryString}` : ''

      return {
        ...object,
        search
      }
    }

    // Override all read methods with query-aware versions.
    const getCurrentLocation: () => Location = () =>
      decodeQuery(history.getCurrentLocation())

    const listenBefore: (hook: Function) => any = (hook) =>
      history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, decodeQuery(location), callback)
      )

    const listen: (hook: Function) => any = (listener) =>
      history.listen(location => listener(decodeQuery(location)))

    // Override all write methods with query-aware versions.
    const push: (location: Location) => any = (location) =>
      history.push(encodeQuery(location, location.query))

    const replace: (location: Location) => any = (location) =>
      history.replace(encodeQuery(location, location.query))

    const createPath: (location: Location) => any = (location) =>
      history.createPath(encodeQuery(location, location.query))

    const createHref: (location: Location) => any = (location) =>
      history.createHref(encodeQuery(location, location.query))

    const createLocation: (location: Location, ...args: any[]) => Location = (location, ...args) => {
      const newLocation: Location =
        history.createLocation(encodeQuery(location, location.query), ...args)

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
