import warning from 'tiny-warning'
import {
  parsePath
} from './PathUtils'
import Actions from './Actions'
import type { Hook, Callback } from './runTransitionHook'
import type {
  HistoryOptions,
  CreateHistory,
  LocationTypeLoader,
  LocationTypeMap,
  LTFromCH,
  History,
  LocationType,
  Unlisten
} from './index'

export default function useBasename<CH extends CreateHistory<any>>(
  createHistory: CH
): CreateHistory<LocationTypeLoader<LTFromCH<CH>,'BASENAME'>> {
  type BaseLocation = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>]['Base']
  type Location = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>]['Intact']

  function ch<LT extends LocationType>(
    options: HistoryOptions = { hashType: 'slash' }
  ): History<
    LocationTypeMap[LT]['Base'],
    LocationTypeMap[LT]['Intact']
  > {
    const history = createHistory(options)
    const { basename } = options

    function addBasename<IL extends Location>(location: IL): IL {
      if (!location)
        return location

      if (basename && !location.basename) {
        if (location.pathname.indexOf(basename) === 0) {
          location.pathname = location.pathname.substring(basename.length)
          location.basename = basename

          if (location.pathname === '')
            location.pathname = '/'
        } else {
          location.basename = ''
        }
      }

      return location
    }

    function prependBasename<BL extends BaseLocation>(location: BL | string = '/'): BL | string {
      if (!basename)
        return location
      
      const object = typeof location === 'string'
        ? parsePath(location)
        : location

      const pname = object.pathname || basename
      const normalizedBasename = basename.slice(-1) === '/' ? basename : `${basename}/`
      const normalizedPathname = pname.charAt(0) === '/' ? pname.slice(1) : pname
      const pathname = normalizedBasename + normalizedPathname

      return {
        ...object,
        pathname
      } as BL
    }

    // Override all read methods with basename-aware versions.
    function getCurrentLocation<IL extends Location>(): IL {
      return addBasename(history.getCurrentLocation())
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

    function listenBefore<IL extends Location>(hook: Hook<IL>): Unlisten {
      return history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, addBasename(location), callback)
      )
    }

    function listen<IL extends Location>(hook: Hook<IL>): Unlisten {
      return history.listen(location => hook(addBasename(location)))
    }

    // Override all write methods with basename-aware versions.
    function push<BL extends BaseLocation>(location: BL | string): void {
      history.push(prependBasename(location))
    }

    function replace<BL extends BaseLocation>(location: BL | string): void {
      history.replace(prependBasename(location))
    }

    function createPath<BL extends BaseLocation>(location: BL | string): string {
      return history.createPath(prependBasename(location))
    }

    function createHref<BL extends BaseLocation>(location: BL | string): string {
      return history.createHref(prependBasename(location))
    }

    function createLocation<
      BL extends BaseLocation = BaseLocation,
      IL extends Location = Location
    >(
      input?: BL | string,
      action?: Actions,
      key?: string
    ): IL {
      return addBasename(history.createLocation(
        prependBasename(input),
        action,
        key
      ))
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
