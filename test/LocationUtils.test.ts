import createHistory from '../src/createHistory'
import { createLocation } from '../src/LocationUtils'
import CH from '../src'

describe('a location', () => {
  it('knows its pathname', () => {
    const location: CH.Location = createLocation('/home?the=query#the-hash')
    expect(location.pathname).toEqual('/home')
  })

  it('knows its search string', () => {
    const location: CH.Location = createLocation('/home?the=query#the-hash')
    expect(location.search).toEqual('?the=query')
  })

  it('knows its hash', () => {
    const location: CH.Location = createLocation('/home?the=query#the-hash')
    expect(location.hash).toEqual('#the-hash')
  })

  it('compensates if the location is fully qualified', () => {
    const location: CH.Location = createLocation('https://example.com/home')
    expect(location.pathname).toEqual('/home')
  })

  it('does not strip URL-like strings in the query', () => {
    const location: CH.Location = createLocation('/home?redirect=https://example.com/')
    expect(location.pathname).toEqual('/home')
    expect(location.search).toEqual('?redirect=https://example.com/')
  })

  it('has undefined state by default', () => {
    const location: CH.Location = createLocation()
    expect(location.state).toBe(undefined)
  })

  it('uses pop navigation by default', () => {
    const location: CH.Location = createLocation()
    expect(location.action).toBe(CH.Actions.POP)
  })

  it('has a null key by default', () => {
    const location: CH.Location = createLocation()
    expect(location.key).toBe(null)
  })

  describe('created by a history object', () => {
    let history
    beforeEach(() => {
      history = createHistory()
    })

    it('has a key by default', () => {
      const location: CH.Location = history.createLocation()
      expect(location.key).toBeDefined()
    })
  })
})

describe('creating a location with an object', () => {
  it('puts the pathname, search, and hash in the proper order', () => {
    const location: CH.Location = createLocation({
      pathname: '/the/path',
      search: '?the=query',
      hash: '#the-hash'
    })

    expect(location.pathname).toEqual('/the/path')
    expect(location.search).toEqual('?the=query')
    expect(location.hash).toEqual('#the-hash')
  })
})
