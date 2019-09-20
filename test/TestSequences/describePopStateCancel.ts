import { Done, Describe } from '../type'
import { NativeLocation } from '../../src'

const describePopStateCancel: Describe = (createHistory) => {
  describe('when popstate transitons are canceled', () => {
    let history: any
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
        const currentLocation: NativeLocation = history.getCurrentLocation()
        expect(currentLocation.pathname).toBe('/c')
        done()
      }, 100)
    })
  })
}

export default describePopStateCancel
