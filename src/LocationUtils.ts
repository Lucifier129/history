/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 14:30:44 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-02 16:59:18
 */

import invariant from 'invariant'
import { parsePath } from './PathUtils'
import Actions, { POP } from './Actions'

export interface Location {
  basename?: string
  pathname?: string
  search?: string
  hash?: string
  state?: any
  key?: string
  action?: any
  query?: object
}

export const createQuery: (props: object) => object = (props) =>
  Object.assign(Object.create(null), props)

export const createLocation: (input: string | Location, action?: Actions, key?: string) => Location
= (input = '/', action = POP, key = null) => {
  const object: Location = typeof input === 'string' ? parsePath(input) : input

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

const isDate: (object: object) => boolean = (object) =>
  Object.prototype.toString.call(object) === '[object Date]'

export const statesAreEqual: (a: any, b: any) => boolean
= (a, b) => {
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

export const locationsAreEqual: (a: Location, b: Location) => boolean
= (a, b) =>
  a.key === b.key && // Different key !== location change.
  // a.action === b.action && // Different action !== location change.
  a.pathname === b.pathname &&
  a.search === b.search &&
  a.hash === b.hash
  && statesAreEqual(a.state, b.state)
