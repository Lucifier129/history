/**
 * Create History Main
 */
/// <reference path="./utils/type.d.ts" />

import Actions from './utils/Actions'

export = CH
export as namespace CH

declare namespace CH {
  /**
   * Main data constructure.
   *
   * History @createHistory
   *
   * Which information need when we create a new history app.
   */
  interface HistoryOptions {
    getCurrentLocation?: GetCurrentLocation
    getUserConfirmation?: GetUserConfirmation
    pushLocation?: PushLocation
    replaceLocation?: ReplaceLocation
    go?: Go
    keyLength?: number
    forceRefresh?: boolean
    queryKey?: string
    hashType?: string
    basename?: string
    stringifyQuery?: Function
    parseQueryString?: Function
    entries?: Location[]
    current?: number
  }

  type Location = Utils.Location

  /**
   * History app constructure
   */
  interface NativeHistory {
    getCurrentLocation: GetCurrentLocation
    listenBefore: History.ListenBefore | Hash.ListenBefore
    listen: History.Listen | Hash.Listen
    transitionTo: History.TransitionTo
    push: History.Push
    replace: History.Replace
    go: Utils.Browser.Go
    goBack: History.GoBack
    goForward: History.GoForward
    createKey: History.CreateKey
    createPath: History.CreatePath
    createHref: History.CreateHref
    createLocation: History.CreateLocation
  }

  interface Memo {
    [propName: string]: any
  }

  interface MemoryOptions extends CH.HistoryOptions {
    entries?: any
    current?: number
  }

  type GetCurrentLocation = History.GetCurrentLocation |
    Hash.GetCurrentLocation |
    Utils.Hash.GetCurrentLocation |
    Utils.Refresh.GetCurrentLocation
  
  type GetUserConfirmation = Utils.Browser.GetUserConfirmation

  type PushLocation = HistoryPushLocation |
    Utils.Browser.PushLocation |
    Hash.PushLocation |
    Utils.Hash.PushLocation |
    Utils.Refresh.PushLocation |
    Memory.PushLocation

  type ReplaceLocation = HistoryReplaceLocation |
    Utils.Browser.ReplaceLocation |
    Utils.Hash.ReplaceLocation |
    Utils.Refresh.ReplaceLocation

  type Go = Utils.Browser.Go

  type CreateHistory = History.CreateHistory |
    Hash.CreateHistory |
    Browser.CreateHistory |
    Memory.CreateHistory

  /**
   * Hash History @createHashHistory
   *
   * Hash path (encode & decode)
   */

  interface PathCoder {
    encodePath: (path: string) => string;
    decodePath: (path: string) => string;
  }

  interface PathCoders {
    hashbang: PathCoder;
    noslash: PathCoder;
    slash: PathCoder;
  }

  /**
   * Function Type Defined
   *
   * History @createHistory
   *
   * The types @History need
   */
  interface HistoryGetCurrentLocation {
    (): Location;
  }

  interface HistoryPushLocation {
    (nextLocation?: Location): boolean;
  }

  interface HistoryReplaceLocation {
    (location: Location): boolean;
  }

  interface HistoryCreatePath {
    (location?: Location | string): string;
  }
  /**
   * @createHistory functions
   */
  module History {
    interface GetCurrentLocation extends HistoryGetCurrentLocation {
    }

    interface ListenBefore {
      (listener: Function): Function;
    }

    interface Listen {
      (listener: Function): Function;
    }

    interface TransitionTo {
      (nextLocation: Location): void;
    }

    interface Push {
      (input: string | Location): void;
    }

    interface Replace {
      (input: string | Location): void;
    }

    interface Go extends Utils.Browser.Go {
    }

    interface GoBack {
      (): void;
    }

    interface GoForward {
      (): void;
    }

    interface CreateKey {
      (): string;
    }

    interface CreatePath extends Utils.Path.CreatePath {
    }

    interface CreateHref {
      (location: Location | string): string;
    }

    interface CreateLocation {
      (
        location: Location | string,
        action?: Actions,
        key?: string
      ): Location;
    }

    interface CreateHistory {
      (options?: HistoryOptions): NativeHistory;
    }

    interface GetCurrentIndex {
      (): number;
    }

    interface UpdateLocation {
      (location: Location): void;
    }

    interface ConfirmTransitionTo {
      (location: Location, callback: (ok: any) => void): void;
    }
  }

  /**
   * Browser
   */
  module Browser {
    interface CreateHistory {
      (options?: HistoryOptions): NativeHistory;
    }

    interface StartListenner {
      (listener: Function, before: boolean): Function
    }

    interface ListenBefore {
      (listener: Function): Function
    }

    interface Listen {
      (listener: Function): Function
    }
  }

  module Hash {
    interface CreateHistory {
      (options?: HistoryOptions): NativeHistory
    }

    interface GetCurrentLocation {
      (): Location
    }

    interface PushLocation {
      (location: Location): void
    }

    interface ReplaceLocation {
      (location: Location): void
    }

    interface StartListener {
      (listener: Function, before: boolean): () => void
    }

    interface ListenBefore {
      (listener: Function): Function
    }

    interface Listen {
      (listener: Function): Function
    }

    interface Go {
      (n: number): void
    }

    interface CreateHref {
      (path: string): string
    }
  }

  module Memory {
    interface CreateHistory {
      (options?: HistoryOptions): NativeHistory
    }

    interface GetCurrentLocation {
      (): Location
    }

    interface CanGo {
      (n: number): boolean
    }

    interface Go {
      (n: number): void
    }

    interface PushLocation {
      (location: Location): void
    }

    interface ReplaceLocation {
      (location: Location): void
    }
  }

  /**
   * Basename
   */
  module Basename {
    interface UseBasename {
      (createHistory: CreateHistory): CreateHistory
    }

    interface AddBasename {
      (location: Location): Location
    }

    interface PrePendBasename {
      (location: Location): Location
    }

    interface GetCurrentLocation {
      (): Location
    }

    interface ListenBefore {
      (hook: Function): any
    }

    interface Listen {
      (listener: Function): any
    }

    interface Push {
      (location: Location): any
    }

    interface Replace {
      (location: Location): any
    }

    interface CreatePath {
      (location: Location): any
    }

    interface CreateHref {
      (location: Location): any
    }

    interface CreateLocation {
      (location: Location, ...args: any[]): Location
    }
  }

  /**
   * BeforeUnload
   */
  module BeforeUnload {
    interface StartListener {
      (getPromptMessage: () => boolean): Function
    }
    interface HandleBeforeUnload {
      (event: Event): boolean
    }
    interface UseBeforeUnload {
      (createHistory: CreateHistory): CreateHistory
    }
  }

  /**
   * Queries
   */
  module Queries {
    interface useQueries {
      (createHistory: CreateHistory): CreateHistory
    }
    
    interface DecodeQuery {
      (location: Location): Location
    }

    interface EncodeQuery {
      (location: Location, query: object): Location
    }
    
    interface GetCurrentLocation {
      (): Location
    }

    interface ListenBefore {
      (hook: Function): any
    }

    interface Listen {
      (listener: Function): any
    }

    interface Push {
      (location: Location): any
    }

    interface Replace {
      (location: Location): any
    }

    interface CreatePath {
      (location: Location): any
    }

    interface CreateHref {
      (location: Location): any
    }

    interface CreateLocation {
      (location: Location, ...args: any[]): Location
    }
  }
}
