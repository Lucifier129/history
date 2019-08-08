import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import CH from '../../src'

const describeInitialLocation: Describe = (createHistory) => {
  describe('on the initial POP', () => {
    let history: CH.NativeHistory
    beforeEach(() => {
      history = createHistory()
    })

    it('location does not have a key', (done: Done) => {
      const steps: Step[] = [
        (location: CH.Location) => {
          expect(location.action).toEqual(CH.Actions.POP)
          expect(location.key).toBeDefined()
        }
      ]

      execSteps(steps, history, done)
    })
  })
}

export default describeInitialLocation
