import Actions from './Actions'
import { Hook } from "./runTransitionHook"
import {
  CreateKey,
  CreateLocation
} from './LocationUtils';
import { CreatePath } from './PathUtils'
import { ParsedQuery } from 'query-string'

export interface BaseLocation {
  pathname?: string
  search?: string
  hash?: string
  state?: any
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
  query?: ParsedQuery
}

export interface ILWithQuery extends Location {
  query: ParsedQuery
}

export interface BLWithBQ extends BaseLocation {
  basename?: string
  query?: ParsedQuery
}

export interface ILWithBQ extends Location {
  basename: string
  query: ParsedQuery
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
  (query: string): ParsedQuery
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
  entries?: any[]
  current?: number
  getUserConfirmation?: GetUserConfirmation
}

export interface GetCurrentLocation<IL extends Location = Location> {
  (): IL
}

export interface Unlisten {
  (): void
}

export interface ListenBefore<IL extends Location = Location> {
  (hook: Hook<IL>): Unlisten
}

export interface Listen<IL extends Location = Location> {
  (hook: Hook<IL>): Unlisten
}

export interface TransitionTo<IL extends Location = Location> {
  (nextLocation: IL): void
}

export interface Push<BL extends BaseLocation = BaseLocation> {
  (input: BL | string): void
}

export interface Replace<BL extends BaseLocation = BaseLocation> {
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

export interface CreateHref<BL extends BaseLocation = BaseLocation> {
  (location: BL | string): string;
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