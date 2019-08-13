import { Done, Describe } from '../type'
import CH from '../../src'

const describePopState: Describe = (createHistory) => {
  describe('when a listenBefore hook is added', () => {
    let history: CH.NativeHistory
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
