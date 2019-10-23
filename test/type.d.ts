import { Location, CreateHistory } from '../src'

export interface Step<L extends Location = Location> {
  (location: L): void
}

export interface Done {
  (...args: any[]): void
}

export interface Describe {
  (createHistory: CreateHistory<any>): void
}