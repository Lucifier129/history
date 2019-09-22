import Actions from './Actions'
import { Hook } from "./runTransitionHook"
import { NativeLocation, BaseLocation, CreateKey, CreateLocation } from './LocationUtils';
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

export interface ListenBeforeUnload<NL extends NativeLocation = NativeLocation> {
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
  listenBeforeUnload?: ListenBeforeUnload<NL>
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

export interface CreateHistory<BL extends BaseLocation = BaseLocation, NL extends NativeLocation = NativeLocation> {
  (options?: HistoryOptions): NativeHistory<BL, NL>
}

export type NHFromCH<CH extends CreateHistory> = CH extends (...args: any[]) => infer NH ? NH : never

export type GCLFromNH<NH extends NativeHistory> = Pick<NH, 'getCurrentLocation'>[keyof Pick<NH, 'getCurrentLocation'>] extends GetCurrentLocation<NativeLocation> ? Pick<NH, 'getCurrentLocation'>[keyof Pick<NH, 'getCurrentLocation'>] : never

export type NLFromGCL<GCL extends GetCurrentLocation<NativeLocation>> = GCL extends (...args: any[]) => infer NL ? NL : never

export type BLFromNL<NL extends NativeLocation> = Partial<Pick<NL, Exclude<keyof NL, 'action' | 'key'>>>

export type NLFromCH<CH extends CreateHistory> = NLFromGCL<GCLFromNH<NHFromCH<CH>>>

export type BLFromCH<CH extends CreateHistory> = BLFromNL<NLFromCH<CH>>