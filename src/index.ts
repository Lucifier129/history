/*
 * @Author: Ma Tianqi 
 * @Date: 2019-08-02 14:30:37 
 * @Last Modified by: Ma Tianqi
 * @Last Modified time: 2019-08-02 17:00:24
 */

import { locationsAreEqual as _locationsAreEqual } from './LocationUtils'

export const locationsAreEqual = _locationsAreEqual
import { default as createHistory } from './createBrowserHistory'
import { default as createHashHistory } from './createHashHistory'
import { default as createMemoryHistory } from './createMemoryHistory'

import { default as useBasename } from './useBasename'
import { default as useBeforeUnload } from './useBeforeUnload'
import { default as useQueries } from './useQueries'

import { default as Actions } from './Actions'

export { Work, Callback } from './AsyncUtils'
export { PathCoder, PathCoders } from './createHashHistory'
export { GetCurrentLocationFunc, HistoryOptions, NativeHistory, CreateHistoryFunc } from './createHistory'
export { Memo } from './createMemoryHistory'
export { Location } from './LocationUtils'

export default {
  locationsAreEqual,

  createHistory,
  createHashHistory,
  createMemoryHistory,

  useBasename,
  useBeforeUnload,
  useQueries,
  
  Actions
}