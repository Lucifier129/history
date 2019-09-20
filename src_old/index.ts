import { locationsAreEqual as _locationsAreEqual } from './LocationUtils'

import createHistory from './createBrowserHistory'
import createHashHistory from './createHashHistory'
import createMemoryHistory from './createMemoryHistory'

import useBasename from './useBasename'
import useBeforeUnload from './useBeforeUnload'
import useQueries from './useQueries'

import Actions from './Actions'

import { PathCoder } from './HashProtocol'

const CH = {
  createHistory,
  createHashHistory,
  createMemoryHistory,

  useBasename,
  useBeforeUnload,
  useQueries,

  Actions
}

export const locationsAreEqual = _locationsAreEqual

export default CH