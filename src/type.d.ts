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
    getCurrentLocation?: GetCurrentLocationFunc;
    getUserConfirmation?: Utils.Browser.GetUserConfirmation;
    pushLocation?: HistoryPushLocation | Utils.Browser.PushLocation;
    replaceLocation?: HistoryReplaceLocation | Utils.Browser.ReplaceLocation;
    go?: Utils.Browser.Go;
    keyLength?: number;
    forceRefresh?: boolean;
    queryKey?: string;
    hashType?: string;
    basename?: string;
    stringifyQuery?: Function;
    parseQueryString?: Function;
    entries?: Location[]
    current?: number
  }

  /**
   * History app constructure
   */
  export interface NativeHistory {
    getCurrentLocation: GetCurrentLocationFunc;
    listenBefore: ListenBefore;
    listen: Listen;
    transitionTo: TransitionTo;
    push: Push;
    replace: Replace;
    go: Utils.Browser.Go;
    goBack: GoBack;
    goForward: GoForward;
    createKey: CreateKey;
    createPath: CreatePath;
    createHref: CreateHref;
    createLocation: CreateLocation;
  }

  export interface Memo {
    [propName: string]: any
  }

  export interface MemoryOptions extends CH.HistoryOptions {
    entries?: any
    current?: number
  }

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
  export interface HistoryGetCurrentLocationFunc {
    (): Location;
  }

  export interface HistoryPushLocation {
    (nextLocation: Location): boolean;
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
    export interface GetCurrentLocation 
      extends HistoryGetCurrentLocationFunc {

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

    export interface ListenBefore {
      (listener: Function): () => any;
    }

    export interface Listen {
      (listener: Function): () => any;
    }

    export interface ConfirmTransitionTo {
      (location: Location, callback: (ok: any) => void): void;
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

    export interface GoBack {
      (): void;
    }

    export interface GoForward {
      (): void;
    }

    export interface CreateKey {
      (): string;
    }

    export interface CreateHref {
      (location: Location): string;
    }

    export interface CreateLocation {
      (
        location: Location | string,
        action: Actions,
        key?: string
      ): Location;
    }
  }

  /**
   * Browser
   */
  export module Browser {
    export interface CreateHistoryFunc {
      (options?: HistoryOptions): NativeHistory;
    }

    export interface StartListenner {
      (listener: Function, before: boolean): () => void;
    }

    export interface ListenBefore {
      (listener: Function): () => void
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
      (listener: Function): void
    }

    export interface Listen {
      (listener: Function): void
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
}
