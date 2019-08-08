/// <reference path="./type.d.ts" />
import { locationsAreEqual as _locationsAreEqual } from './utils/LocationUtils'

export const locationsAreEqual = _locationsAreEqual
import { default as createHistory } from './createBrowserHistory'
import { default as createHashHistory } from './createHashHistory'
import { default as createMemoryHistory } from './createMemoryHistory'

import { default as useBasename } from './useBasename'
import { default as useBeforeUnload } from './useBeforeUnload'
import { default as useQueries } from './useQueries'

export default {
  locationsAreEqual,

  createHistory,
  createHashHistory,
  createMemoryHistory,

  useBasename,
  useBeforeUnload,
  useQueries
}