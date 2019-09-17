import runTransitionHook from './runTransitionHook'
import { parsePath } from './PathUtils'
import { NativeLocation } from './LocationUtils'
import {
  CreateHistory,
  HistoryOptions,
  NativeHistory,
  ListenBefore,
  Listen,
  Push,
  Replace,
  CreatePath,
  CreateHref,
  CreateLocation
} from './createHistory'

export interface UseBasename {
  (createHistory: CreateHistory): CreateHistory
}

export interface AddBasename {
  (location: NativeLocation): NativeLocation
}

export interface PrePendBasename {
  (location: NativeLocation | string): NativeLocation | string
}

export interface GetCurrentLocation {
  (): NativeLocation
}

const useBasename: UseBasename = (createHistory) => (options: HistoryOptions) => {
    const history: NativeHistory = createHistory(options)
    const { basename } = options

    const addBasename: AddBasename = (location) => {
      if (!location)
        return location

      if (basename && location.basename == null) {
        if (location.pathname && location.pathname.indexOf(basename) === 0) {
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

    const prependBasename: PrePendBasename = (location) => {
      if (!basename)
        return location

      const object = typeof location === 'string' ? parsePath(location) : location
      const pname = object.pathname || ''
      const normalizedBasename = basename.slice(-1) === '/' ? basename : `${basename}/`
      const normalizedPathname = pname.charAt(0) === '/' ? pname.slice(1) : pname
      const pathname = normalizedBasename + normalizedPathname

      return {
        ...object,
        pathname
      }
    }

    // Override all read methods with basename-aware versions.
    const getCurrentLocation: GetCurrentLocation = () =>
      addBasename(history.getCurrentLocation())

    const listenBefore: ListenBefore = (hook) =>
      history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, addBasename(location), callback)
      )

    const listen: Listen = (listener) =>
      history.listen(location => listener(addBasename(location)))

    // Override all write methods with basename-aware versions.
    const push: Push = (location) =>
      history.push(prependBasename(location))

    const replace: Replace = (location) =>
      history.replace(prependBasename(location))

    const createPath: CreatePath = (location) =>
      history.createPath(prependBasename(location))

    const createHref: CreateHref = (location) =>
      history.createHref(prependBasename(location))

    const createLocation: CreateLocation = (location, ...args) =>
      addBasename(history.createLocation(prependBasename(location), ...args))

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

export default useBasename
