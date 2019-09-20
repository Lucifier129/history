import { Hook } from "./runTransitionHook"
import { NativeLocation, DraftLocation } from "./LocationUtils"

import {
  BrowserHistory,
  CreateBrowserHistory,
  CreateHref as CFB,
  CreateLocation as CLB
} from "./createBrowserHistory"
import {
  HashHistory,
  CreateHashHistory,
  CreateHref as CFH,
  CreateLocation as CLH
} from "./createHashHistory"
import {
  MemoryHistory,
  CreateMemoryHistory,
  CreateHref as CFM,
  CreateLocation as CLM
} from "./createMemoryHistory"

export type CreateHistory =
  | CreateBrowserHistory
  | CreateHashHistory
  | CreateMemoryHistory

export type NativeHistory = BrowserHistory | HashHistory | MemoryHistory

export type CreateHref = CFB | CFH | CFM

export type CreateLocation = CLB | CLH | CLM

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
  (input: DraftLocation | string): Function | void
}

export interface Replace {
  (input: DraftLocation | string): Function | void
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

export interface CreateKey {
  (): string
}
