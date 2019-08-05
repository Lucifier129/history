import { PUSH } from '../../src/Actions'
import execSteps from './execSteps'

import { Step, Done, Describe } from '../type'
import { NativeHistory } from '../../src/createHistory'
import { Location } from '../../src/LocationUtils'

const describeTransitions: Describe = (createHistory) => {
  describe('a synchronous transition hook', () => {
    let history: NativeHistory
    let unlistenBefore: Function
    beforeEach(() => {
      history = createHistory()
    })

    afterEach(() => {
      if (unlistenBefore)
        unlistenBefore()
    })

    it('receives the next location', (done: Done) => {
      let nextLocation: Location
      const steps: Step[] = [
        () => {
          history.push({
            pathname: '/home',
            search: '?the=query',
            state: { the: 'state' }
          })
        },
        (location: Location) => {
          expect(nextLocation).toBe(location)
        }
      ]

      unlistenBefore = history.listenBefore((location: Location) => {
        nextLocation = location
      })

      execSteps(steps, history, done)
    })
  })

  describe('an asynchronous transition hook', () => {
    let history: NativeHistory
    let unlistenBefore: Function
    beforeEach(() => {
      history = createHistory()
    })

    afterEach(() => {
      if (unlistenBefore)
        unlistenBefore()
    })

    it('receives the next location', (done: Done) => {
      let nextLocation: Location
      const steps: Step[] = [
        () => {
          history.push({
            pathname: '/home',
            search: '?the=query',
            state: { the: 'state' }
          })
        },
        (location: Location) => {
          expect(nextLocation).toBe(location)
        }
      ]

      unlistenBefore = history.listenBefore((location: Location, callback: Function) => {
        nextLocation = location
        setTimeout(callback)
      })

      execSteps(steps, history, done)
    })
  })

  describe('when the user confirms a transition', () => {
    let location: Location
    let history: NativeHistory
    let unlisten: Function
    let unlistenBefore: Function
    beforeEach(() => {
      location = null

      const confirmationMessage: string = 'Are you sure?'

      history = createHistory({
        getUserConfirmation(message, callback) {
          expect(message).toBe(confirmationMessage)
          callback(true)
        }
      })

      unlistenBefore = history.listenBefore(() => confirmationMessage)

      unlisten = history.listen(loc => {
        location = loc
      })
    })

    afterEach(() => {
      if (unlistenBefore)
        unlistenBefore()

      if (unlisten)
        unlisten()
    })

    it('updates the location', () => {
      const prevLocation: Location = location

      history.push({
        pathname: '/home',
        search: '?the=query',
        state: { the: 'state' }
      })

      expect(prevLocation).not.toBe(location)

      expect(location.pathname).toEqual('/home')
      expect(location.search).toEqual('?the=query')
      expect(location.state).toEqual({ the: 'state' })
      expect(location.action).toEqual(PUSH)
      expect(location.key).toBeDefined()
    })
  })

  describe('when the user cancels a transition', () => {
    let location: Location
    let history: NativeHistory
    let unlisten: Function
    let unlistenBefore: Function
    beforeEach(() => {
      location = null

      const confirmationMessage: string = 'Are you sure?'

      history = createHistory({
        getUserConfirmation(message, callback) {
          expect(message).toBe(confirmationMessage)
          callback(false)
        }
      })

      unlistenBefore = history.listenBefore(() => confirmationMessage)

      unlisten = history.listen((loc: Location) => {
        location = loc
      })
    })

    afterEach(() => {
      if (unlistenBefore)
        unlistenBefore()

      if (unlisten)
        unlisten()
    })

    it('does not update the location', () => {
      const prevLocation: Location = location
      history.push('/home')
      expect(prevLocation).toBe(location)
    })
  })

  describe('when the transition hook cancels a transition', () => {
    let location: Location
    let history: NativeHistory
    let unlisten: Function
    let unlistenBefore: Function
    beforeEach(() => {
      location = null

      history = createHistory()

      unlistenBefore = history.listenBefore(() => false)

      unlisten = history.listen((loc: Location) => {
        location = loc
      })
    })

    afterEach(() => {
      if (unlistenBefore)
        unlistenBefore()

      if (unlisten)
        unlisten()
    })

    it('does not update the location', () => {
      const prevLocation: Location = location
      history.push('/home')
      expect(prevLocation).toBe(location)
    })
  })
}

export default describeTransitions
