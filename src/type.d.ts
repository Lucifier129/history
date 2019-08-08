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
    getCurrentLocation?: GetCurrentLocationFunc
    getUserConfirmation?: Utils.GetUserConfirmation
    pushLocation?: HistoryPushLocation | Utils.PushLocation
    replaceLocation?: HistoryReplaceLocation | Utils.ReplaceLocation
    go?: Utils.Go
    keyLength?: number
    forceRefresh?: boolean
    queryKey?: string
    hashType?: string
    basename?: string
    stringifyQuery?: Function
    parseQueryString?: Function
  }
  
  /**
   * History app constructure
   */
  export interface NativeHistory {
    getCurrentLocation: GetCurrentLocationFunc
    listenBefore: ListenBefore
    listen: Listen
    transitionTo: TransitionTo
    push: Push
    replace: Replace
    go: Utils.Go
    goBack: GoBack
    goForward: GoForward
    createKey: CreateKey
    createPath: CreatePath
    createHref: CreateHref
    createLocation: CreateLocation
  }

  /**
   * Hash History @createHashHistory
   * 
   * Hash path (encode & decode)
   */  
  export interface PathCoder {
    encodePath: (path: string) => string
    decodePath: (path: string) => string
  }

  export interface PathCoders {
    hashbang: PathCoder
    noslash: PathCoder
    slash: PathCoder
  }

  /**
   * Function Type Defined
   * 
   * History @createHistory
   * 
   * The types @History need
   */
  export interface GetCurrentLocationFunc {
    (): Location
  }
  
  export interface HistoryPushLocation {
    (nextLocation: Location): boolean
  }
  
  export interface HistoryReplaceLocation {
    (location: Location): boolean
  }

  export interface CreatePath {
    (location?: Location | string): string
  }
  
  /**
   * @createHistory functions
   */
  export interface CreateHistoryFunc {
    (options?: HistoryOptions): NativeHistory
  }
  
  export interface GetCurrentIndex {
    (): number
  }

  export interface UpdateLocation {
    (
      location: Location
    ): void
  }
  
  export interface ListenBefore {
    (listener: Function): () => any
  }
  
  export interface Listen {
    (listener: Function): () => any
  }
  
  export interface ConfirmTransitionTo {
    (
      location: Location,
      callback: (ok: any) => void
    ): void
  }
  
  export interface TransitionTo {
    (nextLocation: Location): void
  }
  
  export interface Push {
    (input: string | Location): void
  }
  
  export interface Replace {
    (input: string | Location): void
  }
  
  export interface GoBack {
    (): void
  }
  
  export interface GoForward {
    (): void
  }
  
  export interface CreateKey {
    (): string
  }
  
  export interface CreateHref {
    (location: Location): string
  }

  export interface CreateLocation {
    (location: Location | string, action: Actions, key?: string): Location
  }
  
 }

