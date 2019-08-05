import { PUSH, POP } from '../../src/Actions'
import execSteps from './execSteps'
import { NativeHistory } from '../../src/createHistory'
import { Location } from '../../src/LocationUtils'
import { Step, Done, Describe } from '../type'

const describeGo: Describe = (createHistory)  => {
  describe('go', () => {
    let history: NativeHistory
    beforeEach(() => {
      history = createHistory()
    })

    // Some browsers need a little time to reflect the
    // hashchange before starting the next test
    afterEach(done => setTimeout(done, 100))

    describe('back', () => {
      it('calls change listeners with the previous location', (done: Done) => {
        const steps: Step[] = [
          (location: Location) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(POP)
            expect(location.key).toBeNull()

            history.push({
              pathname: '/home',
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: Location) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(PUSH)
            expect(location.key).toBeDefined()

            history.goBack()
          },
          (location: Location) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBe(undefined)
            expect(location.action).toEqual(POP)
            expect(location.key).toBe(null)
          }
        ]

        execSteps(steps, history, done)
      })
    })

    describe('forward', () => {
      it('calls change listeners with the next location', (done: Done) => {
        const steps: Step[] = [
          (location: Location) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(POP)
            expect(location.key).toBeNull()

            history.push({
              pathname: '/home',
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: Location) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(PUSH)
            expect(location.key).toBeDefined()

            history.goBack()
          },
          (location: Location) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(POP)
            expect(location.key).toBeNull()

            history.goForward()
          },
          (location: Location) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(POP)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })
    })
  })
}

export default describeGo
