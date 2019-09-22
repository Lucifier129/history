import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { BaseLocation, Actions } from '../../src'

const describeQueryKey: Describe = (createHistory) => {
  describe('when queryKey == "a"', () => {
    let history: any
    beforeEach(() => {
      history = createHistory({ queryKey: 'a' })
    })

    it('remembers state across transitions', (done: Done) => {
      const steps: Step[] = [
        (location: BaseLocation) => {
          expect(location.pathname).toEqual('/')
          expect(location.search).toEqual('')
          expect(location.state).toBeUndefined()
          expect(location.action).toEqual(Actions.POP)
          expect(location.key).toBeNull()

          history.push({
            pathname: '/home',
            search: '?the=query',
            state: { the: 'state' }
          })
        },
        (location: BaseLocation) => {
          expect(location.pathname).toEqual('/home')
          expect(location.search).toEqual('?the=query')
          expect(location.state).toEqual({ the: 'state' })
          expect(location.action).toEqual(Actions.PUSH)
          expect(location.key).toBeDefined()

          history.goBack()
        },
        (location: BaseLocation) => {
          expect(location.pathname).toEqual('/')
          expect(location.search).toEqual('')
          expect(location.state).toBeUndefined()
          expect(location.action).toEqual(Actions.POP)
          expect(location.key).toBeNull()

          history.goForward()
        },
        (location: BaseLocation) => {
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
