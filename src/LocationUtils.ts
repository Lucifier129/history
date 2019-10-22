import invariant from 'invariant'
import { parsePath } from './PathUtils'
import Actions, { POP } from './Actions'
import {
  BaseLocation,
  Location
} from './type'
import { ParsedQuery } from 'query-string'

export interface CreateKey {
  (): string
}


export function createQuery(props?: object): ParsedQuery {
  return Object.assign(Object.create(null), props)
}

export interface CreateLocation<
  BL extends BaseLocation = BaseLocation,
  IL extends Location = Location
> {
  (
    input?: BL | string,
    action?: Actions,
    key?: string
  ): IL
}

export function createLocation<
  BL extends BaseLocation = BaseLocation,
  IL extends Location = Location
>(
  input: BL | string = '/',
  action: Actions = POP,
  key: string = ''
): IL {
  let location = typeof input === 'string'
    ? parsePath(input)
    : input

  let pathname: string = location.pathname || '/'
  let search: string = location.search || ''
  let hash: string = location.hash || ''
  let state: any = location.state

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
  } as IL
}

export function defaultGetUserConfirmation(
  message: string,
  callback: Function
): void {
  callback(window.confirm(message))
}

function isDate(object: object): boolean {
  return Object.prototype.toString.call(object) === '[object Date]'
}

export function statesAreEqual(a: any, b: any): boolean {
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

      return (
        keysofA.length === keysofB.length &&
          keysofA.every(key => statesAreEqual(a[key], b[key]))
      )
    }

    return (
      Array.isArray(b) &&
        a.length === b.length &&
          a.every((item, index) => statesAreEqual(item, b[index]))
    )
  }

  // All other serializable types (string, number, boolean)
  // should be strict equal.
  return false
}

export function locationsAreEqual(a: Location, b: Location): boolean {
  return (
    a.key === b.key && // Different key !== location change.
      a.pathname === b.pathname &&
        a.search === b.search &&
          a.hash === b.hash &&
            statesAreEqual(a.state, b.state)
  )
}

