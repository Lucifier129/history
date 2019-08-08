import runTransitionHook from './utils/runTransitionHook'
import { parsePath } from './utils/PathUtils'
import CH, { HistoryOptions, NativeHistory } from './createHistory'
import { Location } from './utils/LocationUtils'

const useBasename: (createHistory: typeof CH) => (options: HistoryOptions) => NativeHistory
= (createHistory) => (options = {}) => {
    const history: NativeHistory = createHistory(options)
    const { basename } = options

    const addBasename: (location: Location) => Location
    = (location) => {
      if (!location)
        return location

      if (basename && location.basename == null) {
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

    const prependBasename: (location: Location) => Location
    = (location) => {
      if (!basename)
        return location

      const object = typeof location === 'string' ? parsePath(location) : location
      const pname = object.pathname
      const normalizedBasename = basename.slice(-1) === '/' ? basename : `${basename}/`
      const normalizedPathname = pname.charAt(0) === '/' ? pname.slice(1) : pname
      const pathname = normalizedBasename + normalizedPathname

      return {
        ...object,
        pathname
      }
    }

    // Override all read methods with basename-aware versions.
    const getCurrentLocation: () => Location = () =>
      addBasename(history.getCurrentLocation())

    const listenBefore: (hook: Function) => any = (hook) =>
      history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, addBasename(location), callback)
      )

    const listen: (listener: Function) => any = (listener) =>
      history.listen(location => listener(addBasename(location)))

    // Override all write methods with basename-aware versions.
    const push: (location: Location) => any = (location) =>
      history.push(prependBasename(location))

    const replace: (location: Location) => any = (location) =>
      history.replace(prependBasename(location))

    const createPath: (location: Location) => any = (location) =>
      history.createPath(prependBasename(location))

    const createHref: (location: Location) => any = (location) =>
      history.createHref(prependBasename(location))

    const createLocation: (location: Location, ...args: any[]) => Location = (location, ...args) =>
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
