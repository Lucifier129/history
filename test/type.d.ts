import CH from '../src_old/createHistory'

export interface Step {
  (location?: NativeLocation): void
}

export interface Done {
  (...args: any[]): void
}

export interface Describe {
  (createHistory: typeof CH): void
}