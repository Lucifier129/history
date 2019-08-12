import CH from '../src/createHistory'

export interface Step {
  (location?: Location): void
}

export interface Done {
  (...args: any[]): void
}

export interface Describe {
  (createHistory: typeof CH): void
}