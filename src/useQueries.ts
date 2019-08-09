import { parse, stringify } from 'query-string'
import runTransitionHook from './runTransitionHook'
import { createQuery } from './LocationUtils'
import { parsePath } from './PathUtils'
import CH from './index'

const defaultStringifyQuery: (query: object) => string = (query) =>
  stringify(query).replace(/%20/g, '+')

const defaultParseQueryString: Function = parse

/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
const useQueries: CH.Queries.useQueries = (createHistory) =>
  (options = {}) => {
    const history: CH.NativeHistory = createHistory(options)
    let { stringifyQuery, parseQueryString } = options

    if (typeof stringifyQuery !== 'function')
      stringifyQuery = defaultStringifyQuery

    if (typeof parseQueryString !== 'function')
      parseQueryString = defaultParseQueryString

    const decodeQuery: CH.Queries.DecodeQuery = (location) => {
      if (!location)
        return location

      if (location.query == null)
        location.query = parseQueryString(location.search.substring(1))

      return location
    }

    const encodeQuery: CH.Queries.EncodeQuery = (location, query) => {
      if (query == null)
        return location

      const object: CH.Location = typeof location === 'string' ? parsePath(location) : location
      const queryString: string = stringifyQuery(query)
      const search: string = queryString ? `?${queryString}` : ''

      return {
        ...object,
        search
      }
    }

    // Override all read methods with query-aware versions.
    const getCurrentLocation: CH.Queries.GetCurrentLocation = () =>
      decodeQuery(history.getCurrentLocation())

    const listenBefore: CH.Queries.ListenBefore = (hook) =>
      history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, decodeQuery(location), callback)
      )

    const listen: CH.Queries.Listen = (listener) =>
      history.listen(location => listener(decodeQuery(location)))

    // Override all write methods with query-aware versions.
    const push: CH.Queries.Push = (location) =>
      history.push(encodeQuery(location, location.query))

    const replace: CH.Queries.Replace = (location) =>
      history.replace(encodeQuery(location, location.query))

    const createPath: CH.Queries.CreatePath = (location) =>
      history.createPath(encodeQuery(location, location.query))

    const createHref: CH.Queries.CreateHref = (location) =>
      history.createHref(encodeQuery(location, location.query))

    const createLocation: CH.Queries.CreateLocation = (location, ...args) => {
      const newLocation: CH.Location =
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
