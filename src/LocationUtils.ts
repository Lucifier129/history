import invariant from 'invariant'
import { parsePath } from './PathUtils'
import Actions, { POP } from './Actions'
import {
  BaseLocation,
  Location,
  GetUserConfirmation
} from './type'

export interface CreateQuery {
  (props?: object): object
}

export interface CreateKey {
  (): string
}

export interface CreateLocation<
  BL extends BaseLocation = BaseLocation,
  IL extends Location = Location
> {
  (
    location?: BL | string,
    action?: Actions,
    key?: string
  ): IL
}

export interface IsDate {
  (object: object): boolean
}

export interface StatesAreEqual {
  (a: any, b: any): boolean
}

export interface LocationsAreEqual {
  (a: Location, b: Location): boolean
}

export const createQuery: CreateQuery = (props) =>
  Object.assign(Object.create(null), props)

export const createLocation: CreateLocation = (
  input = '/',
  action = POP,
  key = ''
) => {
  const location = typeof input === 'string'
    ? parsePath(input)
    : input

  let pathname: string = location.pathname || '/'
  const search: string = location.search || ''
  const hash: string = location.hash || ''
  const state: any = location.state

  try {
    pathname = decodeURI(pathname)
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError(
        'Pathname "' +
          location.pathname +
          '" could not be decoded. ' +
          'This is likely caused by an invalid percent-encoding.'
      );
    } else {
      throw e;
    }
  }

  return {
    pathname,
    search,
    hash,
    state,
    action,
    key
  }
}

export const defaultGetUserConfirmation: GetUserConfirmation
= (message, callback) => callback(window.confirm(message)) // eslint-disable-line no-alert

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
