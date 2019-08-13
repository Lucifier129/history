import { Describe } from '../type'
import CH from '../../src'

const describeListen: Describe = (createHistory) => {
  let history: CH.NativeHistory
  let unlisten: Function
  beforeEach(() => {
    history = createHistory()
  })

  afterEach(() => {
    if (unlisten)
      unlisten()
  })

  describe('listen', () => {
    it('does not immediately call listeners', () => {
      const spy = jest.fn()
      unlisten = history.listen(spy)
      expect(spy).not.toHaveBeenCalled()
    })
  })
}

export default describeListen
