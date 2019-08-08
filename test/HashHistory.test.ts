import { supportsGoWithoutReloadUsingHash, supportsHistory } from '../src/utils/DOMUtils'
import createHashHistory from '../src/createHashHistory'
import describeListen from './TestSequences/describeListen'
import describeInitialLocation from './TestSequences/describeInitialLocation'
import describeTransitions from './TestSequences/describeTransitions'
import describePush from './TestSequences/describePush'
import describeReplace from './TestSequences/describeReplace'
import describePathCoding from './TestSequences/describePathCoding'
import describePopState from './TestSequences/describePopState'
import describeQueryKey from './TestSequences/describeQueryKey'
import describeBasename from './TestSequences/describeBasename'
import describeQueries from './TestSequences/describeQueries'
import describeGo from './TestSequences/describeGo'

describe('hash history', () => {
  beforeEach(() => {
    if (window.location.hash !== '')
      window.location.hash = ''
  })

  it('knows how to make hrefs', () => {
    const history = createHashHistory()
    expect(history.createHref('/a/path')).toEqual('#/a/path')
  })

  describeListen(createHashHistory)
  describeInitialLocation(createHashHistory)
  describeTransitions(createHashHistory)
  describePush(createHashHistory)
  describeReplace(createHashHistory)
  describeBasename(createHashHistory)
  describeQueries(createHashHistory)

  if (supportsHistory()) {
    describePopState(createHashHistory)
  } else {
    describe.skip(null, () => {
      describePopState(createHashHistory)
    })
  }

  if (supportsHistory() && supportsGoWithoutReloadUsingHash()) {
    describeGo(createHashHistory)
    describeQueryKey(createHashHistory)
    describePathCoding(createHashHistory)
  } else {
    describe.skip(null, () => {
      describeGo(createHashHistory)
      describeQueryKey(createHashHistory)
      describePathCoding(createHashHistory)
    })
  }
})
