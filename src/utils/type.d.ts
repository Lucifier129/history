/**
 * Create History @CH
 *
 * Utils
 * The functions we need when building history.
 * written at {workspace}/src/utils/*.ts
 */
/// <reference path="../type.d.ts" />

import Actions from './Actions'

export = Utils
export as namespace Utils

declare namespace Utils {
  /**
   * This data structure store the mainest information simular browser location
   */
  interface Location {
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
  module Async {
    interface Work {
      (
        currentTurn: number,
        next: () => void,
        done: (...args: any[]) => void
      ): void;
    }

    interface Callback {
      (...args: any[]): void;
    }

    interface LoopAsync {
      (turns: number, work: Work, callback: Callback): void;
    }
  }

  /**
   * BrowserProtocol
   */
  module Browser {
    interface CreateBrowserLocation {
      (historyState: any): Location;
    }

    interface GetBrowserCurrentLocation {
      (): Location;
    }

    interface GetUserConfirmation {
      (message: string, callback: Function): any;
    }

    interface IsExtraneousPopstateEvent {
      (event: any): boolean;
    }

    interface StartListener {
      (listener: Function): () => void;
    }

    interface UpdateState {
      (locationKey: Location, location: Location | string): void;
    }

    interface UpdateLocation {
      (location: Location, updateState?: UpdateState): void;
    }

    interface PushLocation {
      (location: Location): void;
    }

    interface ReplaceLocation {
      (location: Location): void;
    }

    interface Go {
      (n: number): void;
    }
  }

  /**
   * LocationUtils
   */
  module Location {
    interface CreateQuery {
      (props?: object): object;
    }

    interface CreateLocation {
      (
        location?: Location | string,
        action?: Actions,
        key?: string
      ): Location
    }

    interface IsDate {
      (object: object): boolean;
    }

    interface StatesAreEqual {
      (a: any, b: any): boolean;
    }

    interface LocationsAreEqual {
      (a: Location, b: Location): boolean;
    }
  }

  /**
   * DOMUtils
   */
  module DOMUtils {
    interface AddEventListener {
      (
        node: Element | Window,
        event: string,
        listener: EventListenerOrEventListenerObject
      ): void;
    }

    interface RemoveEventListener {
      (
        node: Element | Window,
        event: string,
        listener: EventListenerOrEventListenerObject
      ): void;
    }

    interface SupportsHistory {
      (): boolean;
    }

    interface SupportsGoWithoutReloadUsingHash {
      (): boolean;
    }
  }

  /**
   * DOMStateStorage
   */
  module DOMStateStorage {
    interface CreateKey {
      (key: string): string;
    }

    interface SaveKey {
      (key: string, state: object): void;
    }

    interface ReadState {
      (key: string): void;
    }
  }

  /**
   * PathUtils
   */
  module Path {
    interface AddQueryStringValueToPath {
      (path: string, key: string, value: string): string;
    }

    interface StripQueryStringValueFromPath {
      (path: string, key?: string): string;
    }

    interface GetQueryStringValueFromPath {
      (path: string, key: string): string;
    }

    interface ExtractPath {
      (path: string): string;
    }

    interface ParsePath {
      (path: string): Location;
    }

    interface CreatePath {
      (location?: Location | string): string;
    }
  }

  /**
   * HashProtocol
   */
  module Hash {
    interface GetPath {
      (): string;
    }

    interface PushPath {
      (path: string): string;
    }

    interface ReplacePath {
      (path: string): void;
    }

    interface GetCurrentLocation {
      (pathCoder?: CH.PathCoder, queryKey?: string): Location;
    }

    interface StartListener {
      (
        listener: Function,
        pathCoder: CH.PathCoder,
        queryKey: string
      ): HandleChange;
    }

    interface HandleChange {
      (): void;
    }

    interface Update {
      (path: string): void;
    }

    interface UpdateLocation {
      (
        location: Location,
        pathCoder?: CH.PathCoder,
        queryKey?: string,
        updateHash?: Update
      ): void;
    }
    interface PushLocation {
      (
        location: Location,
        pathCoder?: CH.PathCoder,
        queryKey?: string
      ): void;
    }

    interface ReplaceLocation {
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
  module Refresh {
    interface GetCurrentLocation {
      (): Location
    }

    interface PushLocation {
      (location: Location): boolean
    }

    interface ReplaceLocation {
      (location: Location): boolean
    }
  }

  /**
   * Transition
   */
  module Transition {
    interface RunTransitionHook {
      (
        hook: Function, 
        location: Location, 
        callback: Function
      ): void
    }
  }
}
