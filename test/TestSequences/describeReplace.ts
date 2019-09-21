import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { DraftLocation, Actions } from '../../src'

const describeReplace: Describe = (createHistory) => {
  describe('replace', () => {
    let history: any
    beforeEach(() => {
      history = createHistory()
    })

    describe('with a path string', () => {
      it('calls change listeners with the new location', (done: Done) => {
        const steps: Step[] = [
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)

            history.replace('/home?the=query')
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.REPLACE)
          }
        ]

        execSteps(steps, history, done)
      })
    })

    describe('with a path object', () => {
      it('calls change listeners with the new location', (done: Done) => {
        const steps: Step[] = [
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)

            history.replace({
              pathname: '/home',
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.REPLACE)
          }
        ]

        execSteps(steps, history, done)
      })

      it('correctly merges with old location', (done: Done) => {
        let oldLocation: DraftLocation

        const steps: Step[] = [
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)

            oldLocation = location

            history.replace({
              ...location,
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual(oldLocation.pathname)
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.REPLACE)
            expect(location.key).not.toEqual(oldLocation.key)
          }
        ]

        execSteps(steps, history, done)
      })
    })
  })
}

export default describeReplace
