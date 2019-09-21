import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import { DraftLocation, Actions } from '../../src'

const describePathCoding: Describe = (createHistory) => {
  describe('with the "hashbang" hashType', () => {
    let history: any
    beforeEach(() => {
      history = createHistory({
        hashType: 'hashbang'
      })
    })

    // Some browsers need a little time to reflect the
    // hashchange before starting the next test
    afterEach((done: Done) => setTimeout(done, 100))

    describe('createHref', () => {
      it('knows how to make hrefs', () => {
        expect(history.createHref('/a/path')).toEqual('#!/a/path')
      })
    })

    describe('navigation', () => {
      it('calls change listeners with the correct location', (done: Done) => {
        const steps: Step[] = [
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeNull()

            expect(window.location.hash).toEqual('#!')

            history.push({
              pathname: '/home',
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.PUSH)
            expect(location.key).toBeDefined()

            expect(window.location.hash).toMatch(/^#!\/home/)

            history.goBack()
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeNull()

            expect(window.location.hash).toEqual('#!')

            history.goForward()
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeDefined()

            expect(window.location.hash).toMatch(/^#!\/home/)
          }
        ]

        execSteps(steps, history, done)
      })
    })
  })

  describe('with the "noslash" hashType', () => {
    let history: any
    beforeEach(() => {
      history = createHistory({
        hashType: 'noslash'
      })
    })

    // Some browsers need a little time to reflect the
    // hashchange before starting the next test
    afterEach((done: Done) => setTimeout(done, 100))

    describe('createHref', () => {
      it('knows how to make hrefs', () => {
        expect(history.createHref('/a/path')).toEqual('#a/path')
      })
    })

    describe('navigation', () => {
      it('calls change listeners with the correct location', (done: Done) => {
        const steps: Step[] = [
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeNull()

            // IE 10+ gives us "#", everyone else gives us ""
            expect(window.location.hash).toMatch(/^#?$/)

            history.push({
              pathname: '/home',
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.PUSH)
            expect(location.key).toBeDefined()

            expect(window.location.hash).toMatch(/^#home/)

            history.goBack()
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeNull()

            // IE 10+ gives us "#", everyone else gives us ""
            expect(window.location.hash).toMatch(/^#?$/)

            history.goForward()
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeDefined()

            expect(window.location.hash).toMatch(/^#home/)
          }
        ]

        execSteps(steps, history, done)
      })
    })
  })

  describe('with the "slash" hashType', () => {
    let history: any
    beforeEach(() => {
      history = createHistory({
        hashType: 'slash'
      })
    })

    // Some browsers need a little time to reflect the
    // hashchange before starting the next test
    afterEach((done: Done) => setTimeout(done, 100))

    describe('createHref', () => {
      it('knows how to make hrefs', () => {
        expect(history.createHref('a/path')).toEqual('#/a/path')
      })
    })

    describe('navigation', () => {
      it('calls change listeners with the correct location', (done: Done) => {
        const steps: Step[] = [
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeNull()

            expect(window.location.hash).toEqual('#/')

            history.push({
              pathname: '/home',
              search: '?the=query',
              state: { the: 'state' }
            })
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.PUSH)
            expect(location.key).toBeDefined()

            expect(window.location.hash).toMatch(/^#\/home/)

            history.goBack()
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeNull()

            expect(window.location.hash).toEqual('#/')

            history.goForward()
          },
          (location: DraftLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query')
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(Actions.POP)
            expect(location.key).toBeDefined()

            expect(window.location.hash).toMatch(/^#\/home/)
          }
        ]

        execSteps(steps, history, done)
      })
    })
  })
}

export default describePathCoding
