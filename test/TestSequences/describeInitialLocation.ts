import { POP } from '../../src/Actions'
import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { NativeHistory } from '../../src/createHistory'
import { Location } from '../../src/LocationUtils'

const describeInitialLocation: Describe = (createHistory) => {
  describe('on the initial POP', () => {
    let history: NativeHistory
    beforeEach(() => {
      history = createHistory()
    })

    it('location does not have a key', (done: Done) => {
      const steps: Step[] = [
        (location: Location) => {
          expect(location.action).toEqual(POP)
          expect(location.key).toBeDefined()
        }
      ]

      execSteps(steps, history, done)
    })
  })
}

export default describeInitialLocation
