import runTransitionHook, { Callback } from './runTransitionHook'
import { parsePath, CreatePath } from './PathUtils'
import { NativeLocation, BaseLocation } from './LocationUtils';
import {
  NativeHistory,
  CreateHistory,
  HistoryOptions,
} from './type'

export type WithBasename<L extends BaseLocation> = L & {
  basename?: string
}

export interface UseBasename {
  (createHistory: CreateHistory): CreateHistory
}

export interface AddBasename {
  (location: WithBasename<NativeLocation>): WithBasename<NativeLocation>
}

export interface PrePendBasename {
  (location: BaseLocation | string): BaseLocation | string
}


export interface GetCurrentLocation {
  (): WithBasename<NativeLocation>
}

export interface Hook {
  (location: WithBasename<NativeLocation>, callback?: Callback): any
}

export interface ListenBefore {
  (hook: Hook): any
}

export interface Listen {
  (listener: Hook): any
}

export interface Push {
  (location: WithBasename<BaseLocation> | string): any
}

export interface Replace {
  (location: WithBasename<BaseLocation> | string): any
}

export interface CreatePath {
  (location: WithBasename<BaseLocation> | string): any
}

export interface CreateHref {
  (location: WithBasename<BaseLocation> | string): any
}

export interface CreateLocation {
  (location: WithBasename<BaseLocation> | string, ...args: any[]): WithBasename<NativeLocation>
}

const useBasename: UseBasename = (createHistory) => {
  let ch: CreateHistory = (options: HistoryOptions = { hashType: 'slash' }) => {
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

    const createHref: CreateHref = (location: BaseLocation | string) =>
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

  return ch
}

export default useBasename
