import warning from 'tiny-warning'
import { parse, stringify } from 'querystring'
import { createQuery } from './LocationUtils'
import { parsePath } from './PathUtils'
import Actions from './Actions'
import type { ParsedUrlQueryInput } from 'querystring'
import type { Hook } from './runTransitionHook'
import type { Callback } from './AsyncUtils'
import type{
  CreateHistory,
  HistoryOptions,
  LocationTypeLoader,
  LocationTypeMap,
  LTFromCH,
  History,
  LocationType,
  Unlisten
} from './index'

function defaultStringifyQuery(query: ParsedUrlQueryInput): string {
  return stringify(query).replace(/%20/g, '+')
}

/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
export default function useQueries<CH extends CreateHistory<any>>(
  createHistory: CH
): CreateHistory<LocationTypeLoader<LTFromCH<CH>, 'QUERY'>> {
  type BaseLocation = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'QUERY'>]['Base']
  type Location = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'QUERY'>]['Intact']
  function ch<LT extends LocationType>(
    options: HistoryOptions = { hashType: 'slash' }
  ): History<
    LocationTypeMap[LT]['Base'],
    LocationTypeMap[LT]['Intact']
  > {
    const history = createHistory(options)
    let {
      stringifyQuery = defaultStringifyQuery,
      parseQueryString = parse
    } = options

    if (!stringifyQuery || typeof stringifyQuery !== 'function')
      stringifyQuery = defaultStringifyQuery

    if (!parseQueryString || typeof parseQueryString !== 'function')
      parseQueryString = parse

    function decodeQuery<IL extends Location>(location: IL): IL {
      if (!location) return location

      if (location.query === null || location.query === void 0)
        location.query = parseQueryString(
          location.search ? location.search.substring(1) : ''
        )

      return location
    }

    function encodeQuery<BL extends BaseLocation>(
      location: BL | string,
      query?: ParsedUrlQueryInput
    ): BL | string {
      if (!query)
        return location

      const object: BaseLocation =
        typeof location === 'string' ? parsePath(location) : location
      const queryString: string = stringifyQuery(query)
      const search: string = queryString ? `?${queryString}` : ''
      return {
        ...object,
        search
      } as BL
    }

    function runTransitionHook<IL extends Location>(
      hook: Hook<IL>,
      location: IL,
      callback?: Callback
    ): void {
      const result = hook(location, callback)
    
      if (hook.length < 2) {
        // Assume the hook runs synchronously and automatically
        // call the callback with the return value.
        callback && callback(result)
      } else {
        warning(
          result === void 0,
          'You should not "return" in a transition hook with a callback argument; ' +
          'call the callback instead'
        )
      }
    }

    // Override all read methods with query-aware versions.
    function getCurrentLocation<IL extends Location>(): IL {
      return decodeQuery(history.getCurrentLocation())
    }

    function listenBefore<IL extends Location>(hook: Hook<IL>): Unlisten {
      return history.listenBefore((location, callback) =>
        runTransitionHook(hook, decodeQuery(location), callback)
      )
    }

    function listen<IL extends Location>(hook: Hook<IL>): Unlisten {
      return history.listen(location => hook(decodeQuery(location)))
    }

    // Override all write methods with query-aware versions.
    function push<BL extends BaseLocation>(location: BL | string): void {
      history.push(
        encodeQuery(
          location,
          typeof location === 'string' ? void 0 : location.query
        )
      )
    }

    function replace<BL extends BaseLocation>(location: BL | string): void {
      history.replace(
        encodeQuery(
          location,
          typeof location === 'string' ? void 0 : location.query
        )
      )
    }

    function createPath<BL extends BaseLocation>(location: BL | string): string {
      return history.createPath(
        encodeQuery(
          location,
          typeof location === 'string' ? void 0 : location.query
        )
      )
    }

    function createHref<BL extends BaseLocation>(location: BL | string): string {
      return history.createHref(
        encodeQuery(
          location,
          typeof location === 'string' ? void 0 : location.query
        )
      )
    }

    function createLocation<
      BL extends BaseLocation,
      IL extends Location
    >(
      location: BL | string = '/',
      action?: Actions,
      key?: string
    ): IL {
      let newLocation = encodeQuery(
        location,
        typeof location === 'string' ? void 0 : location.query
      )
      let newLocationAfter: IL = history.createLocation(
        newLocation,
        action,
        key
      )
      if (typeof location !== 'string' && location.query)
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
