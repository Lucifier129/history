///////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////////////////
import { default as _createBrowserHistory } from './createBrowserHistory'
import { default as _createHashHistory } from './createHashHistory'
import { default as _createMemoryHistory } from './createMemoryHistory'

export const createHistory = _createBrowserHistory
export const createHashHistory = _createHashHistory
export const createMemoryHistory = _createMemoryHistory

export default {
  createHistory: _createBrowserHistory,
  createHashHistory: _createHashHistory,
  createMemoryHistory: _createMemoryHistory
}

export { default as useBasename } from './useBasename'
export { default as useBeforeUnload  } from './useBeforeUnload'
export { default as useQueries } from './useQueries'

///////////////////////////////////////////////////////////////////////////////
// CONSTANTS
///////////////////////////////////////////////////////////////////////////////
export { default as Actions } from './Actions'
export * from './Actions'

///////////////////////////////////////////////////////////////////////////////
// TYPES
///////////////////////////////////////////////////////////////////////////////
import type Actions from './Actions'
import type { ParsedUrlQuery, ParsedUrlQueryInput } from 'querystring'
import type { Hook } from './runTransitionHook'
export type { HistoryWithBFOL } from './useBeforeUnload'

export interface BaseLocation {
  pathname?: string
  search?: string
  hash?: string
  state?: unknown
}

export interface Location extends Required<BaseLocation> {
  key: string
  action: Actions
}

export interface BLWithBasename extends BaseLocation {
  basename?: string
}

export interface ILWithBasename extends Location {
  basename: string
}

export interface BLWithQuery extends BaseLocation {
  query?: ParsedUrlQueryInput
}

export interface ILWithQuery extends Location {
  query: ParsedUrlQuery
}

export interface BLWithBQ extends BaseLocation {
  basename?: string
  query?: ParsedUrlQueryInput
}

export interface ILWithBQ extends Location {
  basename: string
  query: ParsedUrlQuery
}

export interface LocationTypeMap {
  NORMAL: {
    Base: BaseLocation,
    Intact: Location
  },
  BASENAME: {
    Base: BLWithBasename,
    Intact: ILWithBasename
  },
  QUERY: {
    Base: BLWithQuery,
    Intact: ILWithQuery
  },
  BQ: {
    Base: BLWithBQ,
    Intact: ILWithBQ
  }
}

export type LocationType = keyof LocationTypeMap

export type LocationTypeLoader<
  FLT extends 'NORMAL' | 'BASENAME' | 'QUERY',
  CLT extends 'BASENAME' | 'QUERY'
> = CLT extends 'BASENAME'
  ? FLT extends 'NORMAL' | 'BASENAME'
    ? 'BASENAME'
    : 'BQ'
  : FLT extends 'NORMAL' | 'QUERY'
    ? 'QUERY'
    : 'BQ'

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
  (query: string): ParsedUrlQuery
}

export interface GetUserConfirmation {
  (message: string, callback: Function): void
}

export interface HistoryOptions {
  keyLength?: number
  forceRefresh?: boolean
  queryKey?: string
  hashType?: keyof PathCoders
  basename?: string
  stringifyQuery?: StringifyQuery
  parseQueryString?: ParseQueryString
  entries?: Location[]
  current?: number
  getUserConfirmation?: GetUserConfirmation
}

export interface PushLocation {
  (location: Location): boolean
}

export interface ReplaceLocation {
  (location: Location): boolean
}

export interface GetCurrentLocation<IL extends Location> {
  (): IL
}

export interface Unlisten {
  (): void
}

export interface ListenBefore<IL extends Location> {
  (hook: Hook<IL>): Unlisten
}

export interface Listen<IL extends Location> {
  (hook: Hook<IL>): Unlisten
}

export interface TransitionTo<IL extends Location> {
  (nextLocation: IL): void
}

export interface Push<BL extends BaseLocation> {
  (input: BL | string): void
}

export interface Replace<BL extends BaseLocation> {
  (input: BL | string): void
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

export interface CreatePath {
  (location: BLWithBQ | string): string
}

export interface CreateHref<BL extends BaseLocation> {
  (location: BL | string): string
}

export interface CreateKey {
  (): string
}

export interface CreateLocation<
  BL extends BaseLocation = BaseLocation,
  IL extends Location = Location
> {
  (
    input?: BL | string,
    action?: Actions,
    key?: string
  ): IL
}

export interface History<
  BL extends BaseLocation = BaseLocation,
  IL extends Location = Location
> {
  getCurrentLocation: GetCurrentLocation<IL>
  listenBefore: ListenBefore<IL>
  listen: Listen<IL>
  transitionTo: TransitionTo<IL>
  push: Push<BL>
  replace: Replace<BL>
  go: Go
  goBack: GoBack
  goForward: GoForward
  createKey: CreateKey
  createPath: CreatePath
  createHref: CreateHref<BL>
  createLocation: CreateLocation<BL, IL>
}

export interface CreateHistory<LT extends LocationType> {
  (options?: HistoryOptions): History<
    LocationTypeMap[LT]['Base'],
    LocationTypeMap[LT]['Intact']
  >
}

export type LTFromCH<CH extends CreateHistory<any>> =
  CH extends CreateHistory<infer LT> ? LT : never