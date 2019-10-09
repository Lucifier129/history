import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { Location, Actions, History } from '../../src'

const describeQueryKey: Describe = (createHistory) => {
  describe('when queryKey == "a"', () => {
    let history: History = createHistory({ queryKey: 'a' })
    beforeEach(() => {
      history = createHistory({ queryKey: 'a' })
    })

    it('remembers state across transitions', (done: Done) => {
      const steps: Step[] = [
        (location: Location) => {
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
        (location: Location) => {
          expect(location.pathname).toEqual('/home')
          expect(location.search).toEqual('?the=query')
          expect(location.state).toEqual({ the: 'state' })
          expect(location.action).toEqual(Actions.PUSH)
          expect(location.key).toBeDefined()

          history.goBack()
        },
        (location: Location) => {
          expect(location.pathname).toEqual('/')
          expect(location.search).toEqual('')
          expect(location.state).toBeUndefined()
          expect(location.action).toEqual(Actions.POP)
          expect(location.key).toBe('')

          history.goForward()
        },
        (location: Location) => {
          expect(location.pathname).toEqual('/home')
          expect(location.search).toEqual('?the=query')
          expect(location.state).toEqual({ the: 'state' }) // State is present
          expect(location.action).toEqual(Actions.POP)
          expect(location.key).toBeDefined()
        }
      ]

      execSteps(steps, history, done)
    })
  })
}

export default describeQueryKey
