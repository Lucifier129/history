import invariant from 'invariant'
import { parsePath } from './PathUtils'
import Actions, { POP } from './Actions'
import { CreateKey } from './type'

export interface BaseLocation {
  basename?: string
  pathname: string
  search?: string
  hash?: string
}

export interface ExceptLocation  {
  state: object | null
  key: string
  action: Actions
  query?: object
}

export type NativeLocation = BaseLocation & ExceptLocation
export type DraftLocation = BaseLocation & Partial<ExceptLocation>

export interface CreateQuery {
  (props?: object): object
}

export interface CreateLocation {
  (
    location?: DraftLocation | string,
    key?: string,
    action?: Actions
  ): NativeLocation
}

export interface IsDate {
  (object: object): boolean
}

export interface StatesAreEqual {
  (a: any, b: any): boolean
}

export interface LocationsAreEqual {
  (a: NativeLocation, b: NativeLocation): boolean
}

export const createQuery: CreateQuery = (props) =>
  Object.assign(Object.create(null), props)

const createKey: CreateKey = () =>
  Math.random().toString(36).substr(2, 6)

export const createLocation: CreateLocation = (input = '/', key = '', action = POP) => {
  const object = typeof input === 'string' ? parsePath(input) : input


  const pathname: string = object.pathname || '/'
  const search: string = object.search || ''
  const hash: string = object.hash || ''
  const state: object | null = null

  return {
    pathname,
    search,
    hash,
    state,
    action,
    key
  }
}

const isDate: IsDate = (object) =>
  Object.prototype.toString.call(object) === '[object Date]'

export const statesAreEqual: StatesAreEqual = (a, b) => {
  if (a === b)
    return true

  const typeofA: string = typeof a
  const typeofB: string = typeof b

  if (typeofA !== typeofB)
    return false

  invariant(
    typeofA !== 'function',
    'You must not store functions in location state'
  )

  // Not the same object, but same type.
  if (typeofA === 'object') {
    invariant(
      !(isDate(a) && isDate(b)),
      'You must not store Date objects in location state'
    )

    if (!Array.isArray(a)) {
      const keysofA: string[] = Object.keys(a)
      const keysofB: string[] = Object.keys(b)
      return keysofA.length === keysofB.length &&
        keysofA.every(key => statesAreEqual(a[key], b[key]))
    }

    return Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => statesAreEqual(item, b[index]))
  }

  // All other serializable types (string, number, boolean)
  // should be strict equal.
  return false
}

export const locationsAreEqual: LocationsAreEqual = (a, b) =>
  a.key === b.key && // Different key !== location change.
  // a.action === b.action && // Different action !== location change.
  a.pathname === b.pathname &&
  a.search === b.search &&
  a.hash === b.hash
  && statesAreEqual(a.state, b.state)
