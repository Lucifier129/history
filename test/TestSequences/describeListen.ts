import { History } from '../../src'
import { Describe } from '../type'

const describeListen: Describe = (createHistory) => {
  let history: History = createHistory()
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

  describe('push', () => {
    it('should notify listener when not silence', () => {
      const spy = jest.fn()
      unlisten = history.listen(spy)
      history.push('/silence', true)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not notify listener when silence', () => {
      const spy = jest.fn()
      unlisten = history.listen(spy)
      history.push('/silence', true)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('replace', () => {
    it('should not notify listener when not  silence', () => {
      const spy = jest.fn()
      unlisten = history.listen(spy)
      history.replace('/silence', true)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not notify listener when silence', () => {
      const spy = jest.fn()
      unlisten = history.listen(spy)
      history.replace('/silence', true)
      expect(spy).not.toHaveBeenCalled()
    })
  })
}

export default describeListen
