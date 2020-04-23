import warning from 'tiny-warning'
import type { BLWithBQ } from './index';

export function addQueryStringValueToPath(
  path: string,
  key: string,
  value: string
): string {
  const { pathname, search, hash } = parsePath(path)

  return createPath({
    pathname,
    search: search + 
      (search && search.indexOf('?') !== -1 ? '&' : '?') + 
        key +
          '=' +
            value
    ,
    hash
  })
}

export function stripQueryStringValueFromPath(
  path: string,
  key?: string
): string {
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

export function getQueryStringValueFromPath(
  path: string,
  key: string
): string {
  const { search } = parsePath(path)
  const match: RegExpMatchArray | null = search
    ? search.match(new RegExp(`[?&]${key}=([a-zA-Z0-9]+)`))
    : null
    
  return match ? match[1] : ''
}

function extractPath(path: string): string {
  let match: RegExpMatchArray | null = null
  if (typeof path === 'string') {
    match = path.match(/^(https?:)?\/\/[^\/]*/)
  }
  return match == null ? path : path.substring(match[0].length)
}

export function parsePath(path: string): BLWithBQ {
  let pathname: string = extractPath(path)
  let search: string = ''
  let hash: string = ''

  warning(
    path === pathname,
    `A path must be pathname + search + hash only, not a full URL like ${path}`,
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

export function createPath(location: BLWithBQ | string): string {
  if (typeof location === 'string') {
    return location
  }
  location = location || {}
  const { basename, pathname, search, hash } = location

  let path = (basename || '') + pathname

  if (search && search !== '?')
    path += search

  if (hash)
    path += hash

  return path
}
