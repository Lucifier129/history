/// <reference path="./index.d.ts" />
import warning from 'warning'

export const addQueryStringValueToPath: Utils.Path.AddQueryStringValueToPath = (path, key, value) => {
  const { pathname, search, hash }: Utils.Location = parsePath(path)

  return createPath({
    pathname,
    search: search + (search.indexOf('?') === -1 ? '?' : '&') + key + '=' + value,
    hash
  })
}

export const stripQueryStringValueFromPath: Utils.Path.StripQueryStringValueFromPath = (path, key) => {
  const { pathname, search, hash }: Utils.Location = parsePath(path)

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

export const getQueryStringValueFromPath: Utils.Path.GetQueryStringValueFromPath
= (path, key) => {
  const { search }: Utils.Location = parsePath(path)
  const match: RegExpMatchArray = search.match(new RegExp(`[?&]${key}=([a-zA-Z0-9]+)`))
  return match && match[1]
}

const extractPath: Utils.Path.ExtractPath = (path) => {
  let match: RegExpMatchArray = null
  if (typeof path === 'string') {
    match = path.match(/^(https?:)?\/\/[^\/]*/)
  }
  return match == null ? path : path.substring(match[0].length)
}

export const parsePath: Utils.Path.ParsePath = (path) => {
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

export const createPath: Utils.Path.CreatePath = (location) => {
  if (location === undefined || typeof location === 'string')
    return <string>location

  const { basename, pathname, search, hash }: Utils.Location = location
  let path = (basename || '') + pathname

  if (search && search !== '?')
    path += search

  if (hash)
    path += hash

  return path
}
