import runTransitionHook from './utils/runTransitionHook'
import { parsePath } from './utils/PathUtils'
import './type'

const useBasename: CH.Basename.UseBasename = (createHistory) => (options = {}) => {
    const history: CH.NativeHistory = createHistory(options)
    const { basename } = options

    const addBasename: CH.Basename.AddBasename = (location) => {
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

    const prependBasename: CH.Basename.PrePendBasename = (location) => {
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
    const getCurrentLocation: CH.Basename.GetCurrentLocation = () =>
      addBasename(history.getCurrentLocation())

    const listenBefore: CH.Basename.ListenBefore = (hook) =>
      history.listenBefore(
        (location, callback) =>
          runTransitionHook(hook, addBasename(location), callback)
      )

    const listen: CH.Basename.Listen = (listener) =>
      history.listen(location => listener(addBasename(location)))

    // Override all write methods with basename-aware versions.
    const push: CH.Basename.Push = (location) =>
      history.push(prependBasename(location))

    const replace: CH.Basename.Replace = (location) =>
      history.replace(prependBasename(location))

    const createPath: CH.Basename.CreatePath = (location) =>
      history.createPath(prependBasename(location))

    const createHref: CH.Basename.CreateHref = (location) =>
      history.createHref(prependBasename(location))

    const createLocation: CH.Basename.CreateLocation = (location, ...args) =>
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
