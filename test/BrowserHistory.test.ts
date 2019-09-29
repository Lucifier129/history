import { supportsHistory } from '../src/DOMUtils'
import createBrowserHistory from '../src/createBrowserHistory'
import describeListen from './TestSequences/describeListen'
import describeInitialLocation from './TestSequences/describeInitialLocation'
import describeTransitions from './TestSequences/describeTransitions'
import describePush from './TestSequences/describePush'
import describeReplace from './TestSequences/describeReplace'
import describePopState from './TestSequences/describePopState'
import describePopStateCancel from './TestSequences/describePopStateCancel'
import describeHashSupport from './TestSequences/describeHashSupport'
import describeBasename from './TestSequences/describeBasename'
import describeQueries from './TestSequences/describeQueries'
import describeGo from './TestSequences/describeGo'

describe('browser history', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  if (supportsHistory()) {
    describeListen(createBrowserHistory)
    describeInitialLocation(createBrowserHistory)
    describeTransitions(createBrowserHistory)
    describePush(createBrowserHistory)
    describeReplace(createBrowserHistory)
    describePopState(createBrowserHistory)
    describePopStateCancel(createBrowserHistory)
    describeHashSupport(createBrowserHistory)
    describeBasename(createBrowserHistory)
    describeQueries(createBrowserHistory)
    describeGo(createBrowserHistory)
  } else {
    describe.skip('', () => {
      describeListen(createBrowserHistory)
      describeInitialLocation(createBrowserHistory)
      describeTransitions(createBrowserHistory)
      describePush(createBrowserHistory)
      describeReplace(createBrowserHistory)
      describePopState(createBrowserHistory)
      describePopStateCancel(createBrowserHistory)
      describeHashSupport(createBrowserHistory)
      describeBasename(createBrowserHistory)
      describeQueries(createBrowserHistory)
      describeGo(createBrowserHistory)
    })
  }
})
