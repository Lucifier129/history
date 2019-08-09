import { locationsAreEqual as _locationsAreEqual } from './LocationUtils'

export const locationsAreEqual = _locationsAreEqual
import createHistory from './createBrowserHistory'
import createHashHistory from './createHashHistory'
import createMemoryHistory from './createMemoryHistory'

import useBasename from './useBasename'
import useBeforeUnload from './useBeforeUnload'
import useQueries from './useQueries'

import Actions from './Actions'

const CH = {
  createHistory,
  createHashHistory,
  createMemoryHistory,

  useBasename,
  useBeforeUnload,
  useQueries,

  Actions
}

export default CH

namespace CH {
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

  export type Location = Utils.Location

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
    export type GetCurrentLocation = HistoryGetCurrentLocation

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

    export type Go = Utils.Browser.Go

    export interface GoBack {
      (): void;
    }

    export interface GoForward {
      (): void;
    }

    export interface CreateKey {
      (): string;
    }

    export type CreatePath = Utils.Path.CreatePath

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
      (): Location
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

/**
 * Utils
 * 
 * The functions we need when building history.
 */
export namespace Utils {
  /**
   * This data structure store the mainest information simular browser location
   */
  export interface Location {
    basename?: string;
    pathname?: string;
    search?: string;
    hash?: string;
    state?: any;
    key?: string;
    action?: any;
    query?: object;
  }
  /**
   * AsyncUtils
   */
  export module Async {
    export interface Work {
      (
        currentTurn: number,
        next: () => void,
        done: (...args: any[]) => void
      ): void;
    }

    export interface Callback {
      (...args: any[]): void;
    }

    export interface LoopAsync {
      (turns: number, work: Work, callback: Callback): void;
    }
  }

  /**
   * BrowserProtocol
   */
  export module Browser {
    export interface CreateBrowserLocation {
      (historyState: any): Location;
    }

    export interface GetBrowserCurrentLocation {
      (): Location;
    }

    export interface GetUserConfirmation {
      (message: string, callback: Function): any;
    }

    export interface IsExtraneousPopstateEvent {
      (event: any): boolean;
    }

    export interface StartListener {
      (listener: Function): () => void;
    }

    export interface UpdateState {
      (locationKey: Location, location: Location | string): void;
    }

    export interface UpdateLocation {
      (location: Location, updateState?: UpdateState): void;
    }

    export interface PushLocation {
      (location: Location): void;
    }

    export interface ReplaceLocation {
      (location: Location): void;
    }

    export interface Go {
      (n: number): void;
    }
  }

  /**
   * LocationUtils
   */
  export module LocationUtil {
    export interface CreateQuery {
      (props?: object): object;
    }

    export interface CreateLocation {
      (
        location?: Location | string,
        action?: Actions,
        key?: string
      ): Location
    }

    export interface IsDate {
      (object: object): boolean;
    }

    export interface StatesAreEqual {
      (a: any, b: any): boolean;
    }

    export interface LocationsAreEqual {
      (a: Location, b: Location): boolean;
    }
  }

  /**
   * DOMUtils
   */
  export module DOMUtils {
    export interface AddEventListener {
      (
        node: Element | Window,
        event: string,
        listener: EventListenerOrEventListenerObject
      ): void;
    }

    export interface RemoveEventListener {
      (
        node: Element | Window,
        event: string,
        listener: EventListenerOrEventListenerObject
      ): void;
    }

    export interface SupportsHistory {
      (): boolean;
    }

    export interface SupportsGoWithoutReloadUsingHash {
      (): boolean;
    }
  }

  /**
   * DOMStateStorage
   */
  export module DOMStateStorage {
    export interface CreateKey {
      (key: string): string;
    }

    export interface SaveKey {
      (key: string, state: object): void;
    }

    export interface ReadState {
      (key: string): void;
    }
  }

  /**
   * PathUtils
   */
  export module Path {
    export interface AddQueryStringValueToPath {
      (path: string, key: string, value: string): string;
    }

    export interface StripQueryStringValueFromPath {
      (path: string, key?: string): string;
    }

    export interface GetQueryStringValueFromPath {
      (path: string, key: string): string;
    }

    export interface ExtractPath {
      (path: string): string;
    }

    export interface ParsePath {
      (path: string): Location;
    }

    export interface CreatePath {
      (location?: Location | string): string;
    }
  }

  /**
   * HashProtocol
   */
  export module Hash {
    export interface GetPath {
      (): string;
    }

    export interface PushPath {
      (path: string): string;
    }

    export interface ReplacePath {
      (path: string): void;
    }

    export interface GetCurrentLocation {
      (pathCoder?: CH.PathCoder, queryKey?: string): Location;
    }

    export interface StartListener {
      (
        listener: Function,
        pathCoder: CH.PathCoder,
        queryKey: string
      ): HandleChange;
    }

    export interface HandleChange {
      (): void;
    }

    export interface Update {
      (path: string): void;
    }

    export interface UpdateLocation {
      (
        location: Location,
        pathCoder?: CH.PathCoder,
        queryKey?: string,
        updateHash?: Update
      ): void;
    }
    export interface PushLocation {
      (
        location: Location,
        pathCoder?: CH.PathCoder,
        queryKey?: string
      ): void;
    }

    export interface ReplaceLocation {
      (
        location: Location,
        pathCoder?: CH.PathCoder,
        queryKey?: string
      ): void
    }
  }

  /**
   * Refresh
   */
  export module Refresh {
    export interface GetCurrentLocation {
      (): Location
    }

    export interface PushLocation {
      (location: Location): boolean
    }

    export interface ReplaceLocation {
      (location: Location): boolean
    }
  }

  /**
   * Transition
   */
  export module Transition {
    export interface RunTransitionHook {
      (
        hook: Function, 
        location: Location, 
        callback: Function
      ): void
    }
  }
}