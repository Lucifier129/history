import { default as _createBrowserHistory } from './createBrowserHistory'

import { default as _createHashHistory } from './createHashHistory'

import { default as _createMemoryHistory } from './createMemoryHistory'

export const createBrowserHistory = _createBrowserHistory

export const createHashHistory = _createHashHistory

export const createMemoryHistory = _createMemoryHistory

export default {
  createBrowserHistory: _createBrowserHistory,
  createHashHistory: _createHashHistory,
  createMemoryHistory: _createMemoryHistory
}

export {
  HistoryOptions,
  CreateHistory,
  History,
  BaseLocation,
  Location,
  BLWithBasename,
  ILWithBasename,
  BLWithQuery,
  ILWithQuery,
  BLWithBQ,
  ILWithBQ,
  LocationType,
  LocationTypeLoader,
  LocationTypeMap
}  from './type'

export { default as useBasename } from './useBasename'

export {
  default as useBeforeUnload,
  HistoryWithBFOL
} from './useBeforeUnload'

export { default as useQueries } from './useQueries'

export { default as Actions } from './Actions'
