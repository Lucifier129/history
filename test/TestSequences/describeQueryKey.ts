import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import CH from '../../src'

const describeQueryKey: Describe = (createHistory) => {
  describe('when queryKey == "a"', () => {
    let history: CH.NativeHistory
    beforeEach(() => {
      history = createHistory({ queryKey: 'a' })
    })

    it('remembers state across transitions', (done: Done) => {
      const steps: Step[] = [
        (location: CH.Location) => {
          expect(location.pathname).toEqual('/')
          expect(location.search).toEqual('')
          expect(location.state).toBeUndefined()
          expect(location.action).toEqual(CH.Actions.POP)
          expect(location.key).toBeNull()

          history.push({
            pathname: '/home',
            search: '?the=query',
            state: { the: 'state' }
          })
        },
        (location: CH.Location) => {
          expect(location.pathname).toEqual('/home')
          expect(location.search).toEqual('?the=query')
          expect(location.state).toEqual({ the: 'state' })
          expect(location.action).toEqual(CH.Actions.PUSH)
          expect(location.key).toBeDefined()

          history.goBack()
        },
        (location: CH.Location) => {
          expect(location.pathname).toEqual('/')
          expect(location.search).toEqual('')
          expect(location.state).toBeUndefined()
          expect(location.action).toEqual(CH.Actions.POP)
          expect(location.key).toBeNull()

          history.goForward()
        },
        (location: CH.Location) => {
          expect(location.pathname).toEqual('/home')
          expect(location.search).toEqual('?the=query')
          expect(location.state).toEqual({ the: 'state' }) // State is present
          expect(location.action).toEqual(CH.Actions.POP)
          expect(location.key).toBeDefined()
        }
      ]

      execSteps(steps, history, done)
    })
  })
}

export default describeQueryKey
