import { locationsAreEqual as _locationsAreEqual } from './LocationUtils'

import createHistory from './createBrowserHistory'
import createHashHistory from './createHashHistory'
import createMemoryHistory from './createMemoryHistory'

import useBasename from './useBasename'
import useBeforeUnload from './useBeforeUnload'
import useQueries from './useQueries'

import Actions from './Actions'

import { PathCoder } from './HashProtocol'

const CH = {
  createHistory,
  createHashHistory,
  createMemoryHistory,

  useBasename,
  useBeforeUnload,
  useQueries,

  Actions
}

export const locationsAreEqual = _locationsAreEqual

export default CH

namespace CH {
  /**
   * Main data constructure.
   *
   * History @createHistory
   *
   * Which information need when we create a new history app.
   */


  export interface GetCurrentLocation {
    (): Location
    
    (pathCoder?: PathCoder, queryKey?: string): Location
  }
  
  export interface GetUserConfirmation {
    (message: string, callback: Function): any
  }

  export interface PushLocation {
    (location: Location): boolean | void

    (
      location: Location,
      pathCoder?: PathCoder,
      queryKey?: string
    ): void
  }

  export interface ReplaceLocation {
    (location: Location): boolean | void
    
    (
      location: Location,
      pathCoder?: PathCoder,
      queryKey?: string
    ): void
  }

  export interface Go {
    (n: number): void
  }

  export interface StringifyQuery {
    (query?: object): string
  }

  export interface ParseQueryString {
    (query?: string): object
  }
  /**
   * History app constructure
   */
  

  export interface CreateHistory {
    (options?: CH.HistoryOptions): CH.NativeHistory;
  }

  export interface ListenBefore {
    (hook: Function): Function
  }

  export interface Listen {
    (hook: Function): Function;
  }

  export interface ListenBeforeUnload {
    (hook: Function): Function
  }

  export interface TransitionTo {
    (nextLocation: Location): void;
  }

  export interface Push {
    (input: string | Location): Function | void;
  }

  export interface Replace {
    (input: Location | string): Function | void;
  }

  export interface GoBack {
    (): void;
  }

  export interface GoForward {
    (): void;
  }

  export interface CreateKey {
    (): string;
  }

  export interface CreatePath {
    (location?: Location | string): string;
  }

  export interface CreateHref {
    (location: Location | string): string;
  }
  
  export interface CreateLocation {
    (
      location: Location | string,
      action?: Actions,
      key?: string
    ): Location;
  }

  /**
   * Hash History @createHashHistory
   *
   * Hash path (encode & decode)
   */

  /**
   * Function Type Defined
   *
   * History @createHistory
   *
   * The types @History need
   */
  export interface HistoryGetCurrentLocation {
    (): Location;
  }

  export interface HistoryPushLocation {
    (nextLocation?: Location): boolean;
  }

  export interface HistoryReplaceLocation {
    (location: Location): boolean;
  }
}

