import Actions from './Actions'
import { Hook } from "./runTransitionHook"
import { CreateKey, CreateLocation } from './LocationUtils';
import { CreatePath } from './PathUtils'

export interface BaseLocation {
  pathname?: string
  search?: string
  hash?: string
  state?: any
}

export interface NativeLocation extends Required<BaseLocation> {
  key: string
  action: Actions
}

export interface BLWithBasename extends BaseLocation {
  basename?: string
}

export interface NLWithBasename extends NativeLocation {
  basename?: string
}

export interface BLWithQuery extends BaseLocation {
  query?: object
}

export interface NLWithQuery extends NativeLocation {
  query?: object
}

export interface BLWithBQ extends BaseLocation {
  basename?: string
  query?: object
}

export interface NLWithBQ extends NativeLocation {
  basename?: string
  query?: object
}

export interface LocationTypeMap {
  NORMAL: {
    Base: BaseLocation,
    Native: NativeLocation
  },
  BASENAME: {
    Base: BLWithBasename,
    Native: NLWithBasename
  },
  QUERY: {
    Base: BLWithQuery,
    Native: NLWithQuery
  },
  BQ: {
    Base: BLWithBQ,
    Native: NLWithBQ
  }
}

export type LocationType = keyof LocationTypeMap

export type LocationTypeLoader<FLT extends 'NORMAL' | 'BASENAME' | 'QUERY', CLT extends 'BASENAME' | 'QUERY'> = CLT extends 'BASENAME'
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
  (query: string): object
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

export interface GetCurrentLocation<NL extends NativeLocation = NativeLocation> {
  (): NL
}

export interface Unlisten {
  (): void
}

export interface ListenBefore<NL extends NativeLocation = NativeLocation> {
  (hook: Hook<NL>): Unlisten
}

export interface Listen<NL extends NativeLocation = NativeLocation> {
  (hook: Hook<NL>): Unlisten
}

export interface TransitionTo<NL extends NativeLocation = NativeLocation> {
  (nextLocation: NL): void
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

export interface NativeHistory<BL extends BaseLocation = BaseLocation, NL extends NativeLocation = NativeLocation> {
  getCurrentLocation: GetCurrentLocation<NL>
  listenBefore: ListenBefore<NL>
  listen: Listen<NL>
  transitionTo: TransitionTo<NL>
  push: Push<BL>
  replace: Replace<BL>
  go: Go
  goBack: GoBack
  goForward: GoForward
  createKey: CreateKey
  createPath: CreatePath
  createHref: CreateHref<BL>
  createLocation: CreateLocation<BL, NL>
}

export interface CreateHistory<LT extends LocationType> {
  (options?: HistoryOptions): NativeHistory<LocationTypeMap[LT]['Base'], LocationTypeMap[LT]['Native']>
}

export type LTFromCH<CH extends CreateHistory<any>> = CH extends CreateHistory<infer LT> ? LT : never