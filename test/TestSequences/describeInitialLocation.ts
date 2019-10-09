import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { Location, Actions, History } from '../../src'

const describeInitialLocation: Describe = (createHistory) => {
  describe('on the initial POP', () => {
    let history: History = createHistory()
    beforeEach(() => {
      history = createHistory()
    })

    it('location does not have a key', (done: Done) => {
      const steps: Step[] = [
        (location: Location) => {
          expect(location.action).toEqual(Actions.POP)
          expect(location.key).toBeDefined()
        }
      ]

      execSteps(steps, history, done)
    })
  })
}

export default describeInitialLocation
