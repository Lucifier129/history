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
    type GetCurrentLocation = HistoryGetCurrentLocation

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

    type Go = Utils.Browser.Go

    interface GoBack {
      (): void;
    }

    interface GoForward {
      (): void;
    }

    interface CreateKey {
      (): string;
    }

    type CreatePath = Utils.Path.CreatePath

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