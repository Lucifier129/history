import warning from 'warning'
import { Callback, RunTransitionHook } from './runTransitionHook'
import { parsePath, CreatePath } from './PathUtils'
import { CreateLocation } from './LocationUtils';
import Actions from './Actions';
import {
  HistoryOptions,
  GetCurrentLocation,
  Listen,
  ListenBefore,
  Push,
  Replace,
  CreateHref,
  CreateHistory,
  NativeLocation,
  BaseLocation,
  LocationTypeLoader,
  LocationTypeMap,
  LTFromCH
} from './type'

export interface UseBasename {
  <CH extends CreateHistory<any>>(createHistory: CH): CreateHistory<LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>>
}

export interface AddBasename<NL extends NativeLocation> {
  (location: NL): NL
}

export interface PrePendBasename<BL extends BaseLocation> {
  (location?: BL | string): BL | string
}


const useBasename: UseBasename = <CH extends CreateHistory<any>>(createHistory: CH) => {
  type BL = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>]['Base']
  type NL = LocationTypeMap[LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>]['Native']
  let ch: CreateHistory<LocationTypeLoader<LTFromCH<CH>, 'BASENAME'>> = (options: HistoryOptions = { hashType: 'slash' }) => {
    const history = createHistory(options)
    const { basename } = options

    const addBasename: AddBasename<NL> = (location) => {
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

    const prependBasename: PrePendBasename<BL> = (location = '/') => {
      if (!basename)
        return location
      
      const object = typeof location === 'string' ? parsePath(location) : location
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
    const getCurrentLocation: GetCurrentLocation<NL> = () =>
      addBasename(history.getCurrentLocation())


    const runTransitionHook: RunTransitionHook<NL> = (hook, location, callback) => {
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

    const listenBefore: ListenBefore<NL> = (hook) =>
      history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, addBasename(location), callback)
      )

    const listen: Listen<NL> = (listener) =>
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

    const createLocation: CreateLocation<BL, NL> = (location, action, key) =>
      addBasename(history.createLocation(prependBasename(location), action, key))

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

export default useBasename
