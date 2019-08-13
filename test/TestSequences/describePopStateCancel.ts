import { Done, Describe } from '../type'
import CH, { Location } from '../../src'

const describePopStateCancel: Describe = (createHistory) => {
  describe('when popstate transitons are canceled', () => {
    let history: CH.NativeHistory
    let unlistenBefore: Function
    beforeEach(() => {
      history = createHistory()
      history.push('/a')
      history.push('/b')
      history.push('/c')

      unlistenBefore = history.listenBefore(() => false)
    })

    afterEach(() => {
      if (unlistenBefore)
        unlistenBefore()
    })

    it('restores the previous location', (done: Done) => {
      window.history.back()

      setTimeout(() => {
        const currentLocation: Location = history.getCurrentLocation()
        expect(currentLocation.pathname).toBe('/c')
        done()
      }, 100)
    })
  })
}

export default describePopStateCancel
