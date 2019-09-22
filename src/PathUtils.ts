import warning from 'warning'
import { BaseLocation } from './LocationUtils'
import { WithBasename } from './useBasename'

export interface AddQueryStringValueToPath {
  (path: string, key: string, value: string): string
}

export interface StripQueryStringValueFromPath {
  (path: string, key?: string): string
}

export interface GetQueryStringValueFromPath {
  (path: string, key: string): string
}

export interface ExtractPath {
  (path: string): string
}

export interface ParsePath {
  (path: string): BaseLocation
}

export interface CreatePath {
  (location: WithBasename<BaseLocation> | string): string
}

export const addQueryStringValueToPath: AddQueryStringValueToPath = (path, key, value) => {
  const { pathname, search, hash } = parsePath(path)

  return createPath({
    pathname,
    search: search + (search && search.indexOf('?') !== -1 ? '&' : '?') + key + '=' + value,
    hash
  })
}

export const stripQueryStringValueFromPath: StripQueryStringValueFromPath = (path, key) => {
  const { pathname, search, hash } = parsePath(path)

  return createPath({
    pathname,
    search: search ? search.replace(
      new RegExp(`([?&])${key}=[a-zA-Z0-9]+(&?)`),
      (match, prefix, suffix) => (
        prefix === '?' ? prefix : suffix
      )
    ) : '',
    hash
  })
}

export const getQueryStringValueFromPath: GetQueryStringValueFromPath
= (path, key) => {
  const { search } = parsePath(path)
  const match: RegExpMatchArray | null = search ? search.match(new RegExp(`[?&]${key}=([a-zA-Z0-9]+)`)) : null
  return match ? match[1] : ''
}

const extractPath: ExtractPath = (path) => {
  let match: RegExpMatchArray | null = null
  if (typeof path === 'string') {
    match = path.match(/^(https?:)?\/\/[^\/]*/)
  }
  return match == null ? path : path.substring(match[0].length)
}

export const parsePath: ParsePath = (path) => {
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

export const createPath: CreatePath = (location) => {
  if (typeof location === 'string') {
    return location
  }

  const { basename, pathname, search, hash } = location

  let path = (basename || '') + pathname

  if (search && search !== '?')
    path += search

  if (hash)
    path += hash

  return path
}
