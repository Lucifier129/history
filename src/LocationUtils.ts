import invariant from 'invariant'
import { parsePath } from './PathUtils'
import { POP } from './Actions'
import { Utils } from './index'

export const createQuery: Utils.LocationUtil.CreateQuery = (props) =>
  Object.assign(Object.create(null), props)

export const createLocation: Utils.LocationUtil.CreateLocation = (input = '/', action = POP, key = null) => {
  const object: Utils.Location = typeof input === 'string' ? parsePath(input) : input

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

const isDate: Utils.LocationUtil.IsDate = (object) =>
  Object.prototype.toString.call(object) === '[object Date]'

export const statesAreEqual: Utils.LocationUtil.StatesAreEqual = (a, b) => {
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

export const locationsAreEqual: Utils.LocationUtil.LocationsAreEqual = (a, b) =>
  a.key === b.key && // Different key !== location change.
  // a.action === b.action && // Different action !== location change.
  a.pathname === b.pathname &&
  a.search === b.search &&
  a.hash === b.hash
  && statesAreEqual(a.state, b.state)
