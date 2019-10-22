import warning from 'warning'
import { RunTransitionHook } from './runTransitionHook'
import {
  parsePath,
  CreatePath
} from './PathUtils'
import { CreateLocation } from './LocationUtils';
import {
  HistoryOptions,
  GetCurrentLocation,
  Listen,
  ListenBefore,
  Push,
  Replace,
  CreateHref,
  CreateHistory,
  LocationTypeLoader,
  LocationTypeMap,
  LTFromCH
} from './type'

export default function useBasename<CH extends CreateHistory<any>>(
  createHistory: CH
): CreateHistory<LocationTypeLoader<LTFromCH<CH>,'BASENAME'>> {
  type BL = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>]['Base']
  type IL = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>]['Intact']

  let ch: CreateHistory<LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>> = (
    options: HistoryOptions = { hashType: 'slash' }
  ) => {
    const history = createHistory(options)
    const { basename } = options

    function addBasename(location: IL): IL {
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

    function prependBasename(location: BL | string = '/'): BL | string {
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
      }
    }

    // Override all read methods with basename-aware versions.
    const getCurrentLocation: GetCurrentLocation<IL> = () =>
      addBasename(history.getCurrentLocation())

    const runTransitionHook: RunTransitionHook<IL> = (
      hook,
      location,
      callback
    ) => {
      const result = hook(location, callback)

      if (hook.length < 2) {
        // Assume the hook runs synchronously and automatically
        // call the callback with the return value.
        callback && callback(result)
      } else {
        warning(
          result === undefined,
          'You should not "return" in a transition hook with a callback argument; ' +
          'call the callback instead'
        )
      }
    }

    const listenBefore: ListenBefore<IL> = (hook) =>
      history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, addBasename(location), callback)
      )

    const listen: Listen<IL> = (listener) =>
      history.listen(location => listener(addBasename(location)))

    // Override all write methods with basename-aware versions.
    const push: Push<BL> = (location) =>
      history.push(prependBasename(location))

    const replace: Replace<BL> = (location) =>
      history.replace(prependBasename(location))

    const createPath: CreatePath = (location) =>
      history.createPath(prependBasename(location))

    const createHref: CreateHref<BL> = (location) =>
      history.createHref(prependBasename(location))

    const createLocation: CreateLocation<BL, IL> = (
      location,
      action,
      key
    ) => addBasename(history.createLocation(
      prependBasename(location),
      action,
      key
    ))

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
