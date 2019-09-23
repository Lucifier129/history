import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { NativeLocation, Actions, NativeHistory } from '../../src'

const describeInitialLocation: Describe = (createHistory) => {
  describe('on the initial POP', () => {
    let history: NativeHistory = createHistory()
    beforeEach(() => {
      history = createHistory()
    })

    it('location does not have a key', (done: Done) => {
      const steps: Step[] = [
        (location: NativeLocation) => {
          expect(location.action).toEqual(Actions.POP)
          expect(location.key).toBeDefined()
        }
      ]

      execSteps(steps, history, done)
    })
  })
}

export default describeInitialLocation
