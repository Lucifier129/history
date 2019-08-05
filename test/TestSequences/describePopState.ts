import { Done, Describe } from '../type'
import { NativeHistory } from '../../src/createHistory'

const describePopState: Describe = (createHistory) => {
  describe('when a listenBefore hook is added', () => {
    let history: NativeHistory
    let unlisten: Function
    beforeEach(() => {
      history = createHistory()
      history.push('/home')
    })

    afterEach(() => {
      if (unlisten)
        unlisten()
    })

    it('is called when browser navigation is used', (done: Done) => {
      unlisten = history.listenBefore(() => {
        done()
      })

      window.history.back()
    })
  })
}

export default describePopState
