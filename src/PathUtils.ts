/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 14:30:54 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-05 16:16:55
 */

import warning from 'warning'
import { Location } from './LocationUtils'

export const addQueryStringValueToPath: (path: string, key: string, value: string) => string
= (path, key, value) => {
  const { pathname, search, hash }: Location = parsePath(path)

  return createPath({
    pathname,
    search: search + (search.indexOf('?') === -1 ? '?' : '&') + key + '=' + value,
    hash
  })
}

export const stripQueryStringValueFromPath: (path: string, key?: string) => string = (path, key) => {
  const { pathname, search, hash }: Location = parsePath(path)

  return createPath({
    pathname,
    search: search.replace(
      new RegExp(`([?&])${key}=[a-zA-Z0-9]+(&?)`),
      (match, prefix, suffix) => (
        prefix === '?' ? prefix : suffix
      )
    ),
    hash
  })
}

export const getQueryStringValueFromPath: (path: string, key: string) => string
= (path, key) => {
  const { search }: Location = parsePath(path)
  const match: RegExpMatchArray = search.match(new RegExp(`[?&]${key}=([a-zA-Z0-9]+)`))
  return match && match[1]
}

const extractPath: (path: string) => string = (path) => {
  let match: RegExpMatchArray = null
  if (typeof path === 'string') {
    match = path.match(/^(https?:)?\/\/[^\/]*/)
  }
  return match == null ? path : path.substring(match[0].length)
}

export const parsePath: (path: string) => Location
= (path) => {
  let pathname: string = extractPath(path)
  let search: string = ''
  let hash: string = ''

  warning(
    path === pathname,
    'A path must be pathname + search + hash only, not a full URL like "%s"',
    path
  )

  let hashIndex: number = -1
  if (typeof pathname === 'string') {
    hashIndex = pathname.indexOf('#')
  }
  if (hashIndex !== -1) {
    hash = pathname.substring(hashIndex)
    pathname = pathname.substring(0, hashIndex)
  }

  let searchIndex: number = -1
  if (typeof pathname === 'string') {
    searchIndex = pathname.indexOf('?')
  }
  if (searchIndex !== -1) {
    search = pathname.substring(searchIndex)
    pathname = pathname.substring(0, searchIndex)
  }

  if (pathname === '')
    pathname = '/'

  return {
    pathname,
    search,
    hash
  }
}

export const createPath: (location?: Location | string) => string = (location) => {
  if (location === undefined || typeof location === 'string')
    return <string>location

  const { basename, pathname, search, hash }: Location = location
  let path = (basename || '') + pathname

  if (search && search !== '?')
    path += search

  if (hash)
    path += hash

  return path
}
