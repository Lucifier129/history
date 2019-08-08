import warning from 'warning'
import './type'

export const addQueryStringValueToPath: CH.Utils.AddQueryStringValueToPath = (path, key, value) => {
  const { pathname, search, hash }: CH.Location = parsePath(path)

  return createPath({
    pathname,
    search: search + (search.indexOf('?') === -1 ? '?' : '&') + key + '=' + value,
    hash
  })
}

export const stripQueryStringValueFromPath: CH.Utils.StripQueryStringValueFromPath = (path, key) => {
  const { pathname, search, hash }: CH.Location = parsePath(path)

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

export const getQueryStringValueFromPath: CH.Utils.GetQueryStringValueFromPath
= (path, key) => {
  const { search }: CH.Location = parsePath(path)
  const match: RegExpMatchArray = search.match(new RegExp(`[?&]${key}=([a-zA-Z0-9]+)`))
  return match && match[1]
}

const extractPath: CH.Utils.ExtractPath = (path) => {
  let match: RegExpMatchArray = null
  if (typeof path === 'string') {
    match = path.match(/^(https?:)?\/\/[^\/]*/)
  }
  return match == null ? path : path.substring(match[0].length)
}

export const parsePath: CH.Utils.ParsePath = (path) => {
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

export const createPath: CH.Utils.CreatePath = (location) => {
  if (location === undefined || typeof location === 'string')
    return <string>location

  const { basename, pathname, search, hash }: CH.Location = location
  let path = (basename || '') + pathname

  if (search && search !== '?')
    path += search

  if (hash)
    path += hash

  return path
}
