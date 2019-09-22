import Actions from './Actions'
import { Hook } from "./runTransitionHook"
import { NativeLocation, BaseLocation, CreateKey } from './LocationUtils';
import { CreatePath } from './PathUtils'

export interface PathCoder {
  encodePath: (path: string) => string
  decodePath: (path: string) => string
}

export interface PathCoders {
  hashbang: PathCoder
  noslash: PathCoder
  slash: PathCoder
}

export interface StringifyQuery {
  (query: object): string
}

export interface ParseQueryString {
  (query: string): object
}

export interface HistoryOptions {
  keyLength?: number
  forceRefresh?: boolean
  queryKey?: string
  hashType?: keyof PathCoders
  basename?: string
  stringifyQuery?: StringifyQuery
  parseQueryString?: ParseQueryString
  [x: string]: any
}

export interface GetCurrentLocation {
  (): NativeLocation
}

export interface Unlisten {
  (): void
}

export interface ListenBefore {
  (hook: Hook): Unlisten
}

export interface Listen {
  (hook: Hook): Unlisten
}

export interface ListenBeforeUnload {
  (hook: Hook): Unlisten
}

export interface TransitionTo {
  (nextLocation: NativeLocation): void
}

export interface Push {
  (input: BaseLocation | string): Function | void
}

export interface Replace {
  (input: BaseLocation | string): Function | void
}

export interface Go {
  (n: number): void
}

export interface GoBack {
  (): void
}

export interface GoForward {
  (): void
}

export interface CreateHref {
  (location: BaseLocation | string): string;
}

export interface CreateLocation {
  (
    location: BaseLocation | string,
    action?: Actions,
    key?: string
  ): NativeLocation;
}

export interface NativeHistory {
  getCurrentLocation: GetCurrentLocation
  listenBefore: ListenBefore
  listen: Listen
  listenBeforeUnload?: ListenBeforeUnload
  transitionTo: TransitionTo
  push: Push
  replace: Replace
  go: Go
  goBack: GoBack
  goForward: GoForward
  createKey: CreateKey
  createPath: CreatePath
  createHref: CreateHref
  createLocation: CreateLocation
}

export interface CreateHistory {
  (options?: HistoryOptions): NativeHistory
}