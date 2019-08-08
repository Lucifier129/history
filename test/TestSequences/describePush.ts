/// <reference path="../../src/type.d.ts" />
import execSteps from './execSteps'

import { Step, Done, Describe } from '../type'

const describePush: Describe = (createHistory) => {
  describe('push', () => {
    let history: CH.NativeHistory
    beforeEach(() => {
      history = createHistory()
    })

    describe('with a path string', () => {
      it('calls change listeners with the new location', (done: Done) => {
        const steps: Step[] = [
          (location: CH.Location) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(CH.Actions.POP)
            expect(location.key).toBeNull()

            history.push('/home?the=query')
          },
          (location: CHLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(PUSH)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })

      it('should trigger only once when path is changed', (done: Done) => {
        const spy: jest.Mock = jest.fn()
        const unlisten: Function = history.listen(spy)
        history.push('/test')
        setTimeout(() => {
          expect(spy.mock.calls.length).toBe(1)
          unlisten()
          done()
        }, 10)
      })
    })

    describe('with a path object', () => {
      it('calls change listeners with the new location', (done: Done) => {
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
          }
        ]

        execSteps(steps, history, done)
      })

      it('correctly merges with old location', (done: Done) => {
        let oldLocation

        const steps: Step[] = [
          (location: Location) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(POP)
            expect(location.key).toBeNull()

            oldLocation = location

            history.push({
              ...location,
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: Location) => {
            expect(location.pathname).toEqual(oldLocation.pathname)
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(PUSH)
            expect(location.key).toBeDefined()
            expect(location.key).not.toEqual(oldLocation.key)
          }
        ]

        execSteps(steps, history, done)
      })

      it('becomes a REPLACE if path is unchanged', (done: Done) => {
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
            expect(location.action).toEqual(REPLACE)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })

      it('stays PUSH if state is changed', (done: Done) => {
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

            history.push({
              pathname: '/home',
              search: '?the=query',
              state: { different: 'state' }
            })
          },
          (location: Location) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ different: 'state' })
            expect(location.action).toEqual(PUSH)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })
    })
  })
}

export default describePush
