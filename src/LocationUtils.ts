import invariant from 'invariant'
import { parsePath } from './PathUtils'
import Actions, { POP } from './Actions'
import { Location } from './index'

export interface CreateQuery {
  (props?: object): object;
}

export interface CreateLocation {
  (
    location?: Location | string,
    action?: Actions,
    key?: string
  ): Location
}

export interface IsDate {
  (object: object): boolean;
}

export interface StatesAreEqual {
  (a: any, b: any): boolean;
}

export interface LocationsAreEqual {
  (a: Location, b: Location): boolean;
}

export const createQuery: CreateQuery = (props) =>
  Object.assign(Object.create(null), props)

export const createLocation: CreateLocation = (input = '/', action = POP, key = null) => {
  const object: Location = typeof input === 'string' ? parsePath(input) : input

  // console.log(input)
  // console.log(object)

  const pathname: string = object.pathname || '/'
  const search: string = object.search || ''
  const hash: string = object.hash || ''
  const state: string = object.state

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
