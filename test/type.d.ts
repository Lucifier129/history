import { NativeLocation, CreateHistory } from '../src'

export interface Step {
  (location: NativeLocation): void
}

export interface Done {
  (...args: any[]): void
}

export interface Describe {
  (createHistory: CreateHistory): void
}