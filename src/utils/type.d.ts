/**
 * Create History @CH
 * 
 * Utils
 * The functions we need when building history.
 * written at {workspace}/src/utils/*.ts
 */
declare namespace CH {
  
  /**
   * This data structure store the mainest information simular browser location 
   */
  export interface Location {
    basename?: string
    pathname?: string
    search?: string
    hash?: string
    state?: any
    key?: string
    action?: any
    query?: object
  }

  /**
   * History change state need this indication to distinguish which type.
   */
  export enum  Actions {
    /**
     * Indicates that navigation was caused by a call to history.push.
     */
    PUSH,
    /**
     * Indicates that navigation was caused by a call to history.replace.
     */
    REPLACE,
    /**
     * Indicates that navigation was caused by some other action such
     * as using a browser's back/forward buttons and/or manually manipulating
     * the URL in a browser's location bar. This is the default.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
     * for more information.
     */
    POP
  }

  export module Utils {
    /**
     * AsyncUtils
     */
    export interface Work {
      (currentTurn: number, next: () => void, done: (...args: any[]) => void): void
    }

    export interface Callback {
      (...args: any[]): void
    }

    export interface LoopAsync {
      (turns: number, work: Work, callback: Callback): void
    }

    /**
     * BrowserProtocol
     */
    export interface CreateBrowserLocation {
      (historyState: any): Location
    }

    export interface GetBrowserCurrentLocation {
      (): Location
    }

    export interface GetUserConfirmation {
      (message: string, callback: Function): any
    }

    export interface IsExtraneousPopstateEvent {
      (event: any): boolean
    }

    export interface BrowserStartListener {
      (listener: Function): () => void
    }

    export interface UpdateState {
      (locationKey: Location, location: Location | string): void
    }

    export interface BrowserUpdateLocation {
      (
        location: Location,
        updateState?: UpdateState
      ): void
    }

    export interface PushLocation {
      (location: Location): void
    }

    export interface ReplaceLocation {
      (location: Location): void
    }

    export interface Go {
      (n: number): void
    }

    /**
     * LocationUtils
     */

    export interface CreateQuery {
      (props?: object): object
    }

    export interface IsDate {
      (object: object): boolean
    }

    export interface StatesAreEqual {
      (a: any, b: any): boolean
    }

    export interface LocationsAreEqual {
      (a: Location, b: Location): boolean
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
        ): void
      }
      
      export interface RemoveEventListener {
        (
          node: Element | Window,
          event: string,
          listener: EventListenerOrEventListenerObject
        ): void
      }
      
      export interface SupportsHistory {
        (): boolean
      }
  
      export interface SupportsGoWithoutReloadUsingHash {
        (): boolean
      }
    }

    /**
     * DOMStateStorage
     */
    export module DOMStateStorage {
      export interface CreateKey {
        (key: string): string
      }
      
      export interface SaveKey {
        (key: string, state: object): void
      }
      
      export interface ReadState {
        (key: string): void
      }
    }

    /**
     * PathUtils
     */
    export module PathUtils {
      export interface AddQueryStringValueToPath {
        (
          path: string,
          key: string,
          value: string
        ): string
      }
      
      export interface StripQueryStringValueFromPath {
        (path: string, key?: string): string
      }
      
      export interface GetQueryStringValueFromPath {
        (path: string, key: string): string
      }
      
      export interface ExtractPath {
        (path: string): string
      }
      
      export interface ParsePath {
        (path: string): Location
      }
      
      export interface CreatePath {
        (location?: Location | string): string
      }
    }
    
    /**
     * HashProtocol
     */
    export module Hash {
      export interface GetPath {
        (): string
      }
      
      export interface PushPath {
        (path: string): string
      }
      
      export interface ReplacePath {
        (path: string): void
      }
      
      export interface GetCurrentLocation {
        (pathCoder: CH.PathCoder, queryKey: string): Location
      }
  
      export interface StartListener {
        (
          listener: Function,
          pathCoder: PathCoder,
          queryKey: string
        ): HandleChange
      }
  
      export interface HandleChange {
        (): void
      }

      export interface Update {
        (path: string): void
      }
  
      export interface UpdateLocation {
        (
          location: Location,
          pathCoder: PathCoder,
          queryKey: string,
          updateHash: Update
        ): void
      }
      export interface PushLocation {
        (
          location: Location,
          pathCoder: CH.PathCoder,
          queryKey: string
        ): void
      }
    }
  }
}

