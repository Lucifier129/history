import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { NativeLocation, Actions, NativeHistory } from '../../src'

const describeGo: Describe = (createHistory)  => {
  describe('go', () => {
    let history: NativeHistory = createHistory()
    beforeEach(() => {
      history = createHistory()
    })

    // Some browsers need a little time to reflect the
    // hashchange before starting the next test
    afterEach(done => setTimeout(done, 100))

    describe('back', () => {
      it('calls change listeners with the previous location', (done: Done) => {
        const steps: Step[] = [
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBe('')

            history.push({
              pathname: '/home',
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.PUSH)
            expect(location.key).toBeDefined()

            history.goBack()
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBe(undefined)
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBe('')
          }
        ]

        execSteps(steps, history, done)
      })
    })

    describe('forward', () => {
      it('calls change listeners with the next location', (done: Done) => {
        const steps: Step[] = [
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBe('')

            history.push({
              pathname: '/home',
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.PUSH)
            expect(location.key).toBeDefined()

            history.push({
              pathname: '/person',
              search: '?the=query',
              state: { the: 'state a' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/person')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state a' })
            expect(location.action).toEqual(Actions.PUSH)
            expect(location.key).toBeDefined()

            history.goBack()
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeDefined()

            history.goBack()
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBe('')

            history.goForward()
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })
    })
  })
}

export default describeGo
