import { Location, CreateHistory } from '../src'

export interface Step {
  (location: Location): void
}

export interface Done {
  (...args: any[]): void
}

export interface Describe {
  (createHistory: CreateHistory<any>): void
}