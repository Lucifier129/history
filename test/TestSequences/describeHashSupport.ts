import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { DraftLocation, Actions } from '../../src'

const describeHashSupport: Describe = (createHistory) => {
  describe('when a URL with a hash is pushed', () => {
    let history: any
    beforeEach(() => {
      history = createHistory()
    })

    it('preserves the hash', (done: Done) => {
      const steps: Step[] = [
        (location: DraftLocation) => {
          expect(location.pathname).toEqual('/')
          expect(location.search).toEqual('')
          expect(location.hash).toEqual('')
          expect(location.state).toBeUndefined()
          expect(location.action).toEqual(Actions.POP)
          expect(location.key).toBeNull()

          history.push({
            pathname: '/home',
            search: '?the=query',
            hash: '#the-hash',
            state: { the: 'state' }
          })
        },
        (location: DraftLocation) => {
          expect(location.pathname).toEqual('/home')
          expect(location.search).toEqual('?the=query')
          expect(location.hash).toEqual('#the-hash')
          expect(location.state).toEqual({ the: 'state' })
          expect(location.action).toEqual(Actions.PUSH)
          expect(location.key).toBeDefined()
        }
      ]

      execSteps(steps, history, done)
    })

    it('does not convert PUSH to REPLACE if path does not change', (done: Done) => {
      const steps: Step[] = [
        (location: DraftLocation) => {
          expect(location.pathname).toEqual('/')
          expect(location.search).toEqual('')
          expect(location.hash).toEqual('')
          expect(location.state).toBeUndefined()
          expect(location.action).toEqual(Actions.POP)
          expect(location.key).toBeNull()

          history.push('/#the-hash')
        },
        (location: DraftLocation) => {
          expect(location.pathname).toEqual('/')
          expect(location.search).toEqual('')
          expect(location.hash).toEqual('#the-hash')
          expect(location.state).toBeUndefined()
          expect(location.action).toEqual(Actions.PUSH)
          expect(location.key).toBeDefined()
        }
      ]

      execSteps(steps, history, done)
    })
  })
}

export default describeHashSupport
