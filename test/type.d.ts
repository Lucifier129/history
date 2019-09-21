import { DraftLocation, CreateHistory } from '../src'

export interface Step {
  (location: DraftLocation): void
}

export interface Done {
  (...args: any[]): void
}

export interface Describe {
  (createHistory: CreateHistory): void
}