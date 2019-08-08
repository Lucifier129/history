/**
 * Create History Main
 */
/// <reference path="./utils/type.d.ts" />

declare namespace CH {
  /**
   * Main data constructure.
   *
   * History @createHistory
   *
   * Which information need when we create a new history app.
   */
  export interface HistoryOptions {
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

  /**
   * History app constructure
   */
  export interface NativeHistory {
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

  export interface Memo {
    [propName: string]: any
  }

  export interface MemoryOptions extends CH.HistoryOptions {
    entries?: any
    current?: number
  }

  export type GetCurrentLocation = History.GetCurrentLocation |
    Hash.GetCurrentLocation |
    Utils.Hash.GetCurrentLocation |
    Utils.Refresh.GetCurrentLocation
  
  export type GetUserConfirmation = Utils.Browser.GetUserConfirmation

  export type PushLocation = HistoryPushLocation |
    Utils.Browser.PushLocation |
    Hash.PushLocation |
    Utils.Hash.PushLocation |
    Utils.Refresh.PushLocation |
    Memory.PushLocation

  export type ReplaceLocation = HistoryReplaceLocation |
    Utils.Browser.ReplaceLocation |
    Utils.Hash.ReplaceLocation |
    Utils.Refresh.ReplaceLocation

  export type Go = Utils.Browser.Go

  export type CreateHistory = History.CreateHistory |
    Hash.CreateHistory |
    Browser.CreateHistory |
    Memory.CreateHistory

  /**
   * Hash History @createHashHistory
   *
   * Hash path (encode & decode)
   */

  export interface PathCoder {
    encodePath: (path: string) => string;
    decodePath: (path: string) => string;
  }

  export interface PathCoders {
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
  export interface HistoryGetCurrentLocation {
    (): Location;
  }

  export interface HistoryPushLocation {
    (nextLocation?: Location): boolean;
  }

  export interface HistoryReplaceLocation {
    (location: Location): boolean;
  }

  export interface HistoryCreatePath {
    (location?: Location | string): string;
  }
  /**
   * @createHistory functions
   */
  export module History {
    export interface GetCurrentLocation extends HistoryGetCurrentLocation {
    }

    export interface ListenBefore {
      (listener: Function): Function;
    }

    export interface Listen {
      (listener: Function): Function;
    }

    export interface TransitionTo {
      (nextLocation: Location): void;
    }

    export interface Push {
      (input: string | Location): void;
    }

    export interface Replace {
      (input: string | Location): void;
    }

    export interface Go extends Utils.Browser.Go {
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

    export interface CreatePath extends Utils.Path.CreatePath {
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

    export interface CreateHistory {
      (options?: HistoryOptions): NativeHistory;
    }

    export interface GetCurrentIndex {
      (): number;
    }

    export interface UpdateLocation {
      (location: Location): void;
    }

    export interface ConfirmTransitionTo {
      (location: Location, callback: (ok: any) => void): void;
    }
  }

  /**
   * Browser
   */
  export module Browser {
    export interface CreateHistory {
      (options?: HistoryOptions): NativeHistory;
    }

    export interface StartListenner {
      (listener: Function, before: boolean): Function
    }

    export interface ListenBefore {
      (listener: Function): Function
    }

    export interface Listen {
      (listener: Function): Function
    }
  }

  export module Hash {
    export interface CreateHistory {
      (options?: HistoryOptions): NativeHistory
    }

    export interface GetCurrentLocation {
      (): CH.Location
    }

    export interface PushLocation {
      (location: Location): void
    }

    export interface ReplaceLocation {
      (location: Location): void
    }

    export interface StartListener {
      (listener: Function, before: boolean): () => void
    }

    export interface ListenBefore {
      (listener: Function): Function
    }

    export interface Listen {
      (listener: Function): Function
    }

    export interface Go {
      (n: number): void
    }

    export interface CreateHref {
      (path: string): string
    }
  }

  export module Memory {
    export interface CreateHistory {
      (options?: HistoryOptions): NativeHistory
    }

    export interface GetCurrentLocation {
      (): Location
    }

    export interface CanGo {
      (n: number): boolean
    }

    export interface Go {
      (n: number): void
    }

    export interface PushLocation {
      (location: Location): void
    }

    export interface ReplaceLocation {
      (location: Location): void
    }
  }

  /**
   * Basename
   */
  export module Basename {
    export interface UseBasename {
      (createHistory: CreateHistory): CreateHistory
    }

    export interface AddBasename {
      (location: Location): Location
    }

    export interface PrePendBasename {
      (location: Location): Location
    }

    export interface GetCurrentLocation {
      (): Location
    }

    export interface ListenBefore {
      (hook: Function): any
    }

    export interface Listen {
      (listener: Function): any
    }

    export interface Push {
      (location: Location): any
    }

    export interface Replace {
      (location: Location): any
    }

    export interface CreatePath {
      (location: Location): any
    }

    export interface CreateHref {
      (location: Location): any
    }

    export interface CreateLocation {
      (location: Location, ...args: any[]): Location
    }
  }

  /**
   * BeforeUnload
   */
  export module BeforeUnload {
    export interface StartListener {
      (getPromptMessage: () => boolean): Function
    }
    export interface HandleBeforeUnload {
      (event: Event): boolean
    }
    export interface UseBeforeUnload {
      (createHistory: CreateHistory): CreateHistory
    }
  }

  /**
   * Queries
   */
  export module Queries {
    export interface useQueries {
      (createHistory: CreateHistory): CreateHistory
    }
    
    export interface DecodeQuery {
      (location: Location): Location
    }

    export interface EncodeQuery {
      (location: Location, query: object): Location
    }
    
    export interface GetCurrentLocation {
      (): Location
    }

    export interface ListenBefore {
      (hook: Function): any
    }

    export interface Listen {
      (listener: Function): any
    }

    export interface Push {
      (location: Location): any
    }

    export interface Replace {
      (location: Location): any
    }

    export interface CreatePath {
      (location: Location): any
    }

    export interface CreateHref {
      (location: Location): any
    }

    export interface CreateLocation {
      (location: Location, ...args: any[]): Location
    }
  }
}
