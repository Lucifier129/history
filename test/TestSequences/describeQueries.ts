import { createQuery } from '../../src/LocationUtils'
import useQueries from '../../src/useQueries'
import execSteps from './execSteps'
import { Step, Done, Describe } from '../type'
import CH, { NativeLocation } from '../../src'


const stripHash: (path: string) => string = (path) =>
  path.replace(/^#/, '')

const describeQueries: Describe = (createHistory) => {
  describe('default query serialization', () => {
    let history: CH.NativeHistory
    beforeEach(() => {
      history = useQueries(createHistory)()
    })

    describe('in push', () => {
      it('works', (done: Done) => {
        const steps: Step[] = [
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.query).toEqual(createQuery())
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(CH.Actions.POP)
            expect(location.key).toBeNull()

            history.push({
              pathname: '/home',
              query: { the: 'query value' },
              state: { the: 'state' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query+value')
            expect(location.query).toEqual(createQuery({ the: 'query value' }))
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(CH.Actions.PUSH)
            expect(location.key).toBeDefined()

            history.push({
              ...location,
              query: { other: 'query value' },
              state: { other: 'state' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?other=query+value')
            expect(location.query).toEqual(createQuery({ other: 'query value' }))
            expect(location.state).toEqual({ other: 'state' })
            expect(location.action).toEqual(CH.Actions.PUSH)
            expect(location.key).toBeDefined()

            history.push({
              ...location,
              query: {},
              state: null
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('')
            expect(location.query).toEqual(createQuery())
            expect(location.state).toBeNull()
            expect(location.action).toEqual(CH.Actions.PUSH)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })
    })

    describe('in replace', () => {
      it('works', (done: Done) => {
        const steps: Step[] = [
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.query).toEqual(createQuery({}))
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(CH.Actions.POP)
            expect(location.key).toBeNull()

            history.replace({
              pathname: '/home',
              query: { the: 'query value' },
              state: { the: 'state' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?the=query+value')
            expect(location.query).toEqual(createQuery({ the: 'query value' }))
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(CH.Actions.REPLACE)
            expect(location.key).toBeDefined()

            history.replace({
              ...location,
              query: { other: 'query value' },
              state: { other: 'state' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?other=query+value')
            expect(location.query).toEqual(createQuery({ other: 'query value' }))
            expect(location.state).toEqual({ other: 'state' })
            expect(location.action).toEqual(CH.Actions.REPLACE)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })
    })

    describe('in createPath', () => {
      it('works', () => {
        expect(
          history.createPath({
            pathname: '/the/path',
            query: { the: 'query value' }
          })
        ).toEqual('/the/path?the=query+value')
      })

      it('does not strip trailing slash', () => {
        expect(
          history.createPath({
            pathname: '/the/path/',
            query: { the: 'query value' }
          })
        ).toEqual('/the/path/?the=query+value')
      })

      describe('when the path contains a hash', () => {
        it('puts the query before the hash', () => {
          expect(
            history.createPath({
              pathname: '/the/path',
              hash: '#the-hash',
              query: { the: 'query value' }
            })
          ).toEqual('/the/path?the=query+value#the-hash')
        })
      })

      describe('when there is already an existing search', () => {
        it('overwrites the existing search', () => {
          expect(
            history.createPath({
              pathname: '/the/path',
              search: '?a=one',
              query: { the: 'query value' }
            })
          ).toEqual('/the/path?the=query+value')
        })
      })
    })

    describe('in createLocation', () => {
      it('works with string', () => {
        const location: NativeLocation = history.createLocation('/the/path?the=query')

        expect(location.pathname).toEqual('/the/path')
        expect(location.query).toEqual(createQuery({ the: 'query' }))
        expect(location.search).toEqual('?the=query')
      })

      it('works with object with query', () => {
        const location: NativeLocation = history.createLocation({
          pathname: '/the/path',
          query: { the: 'query' }
        })

        expect(location.pathname).toEqual('/the/path')
        expect(location.query).toEqual(createQuery({ the: 'query' }))
        expect(location.search).toEqual('?the=query')
      })

      it('works with object without query', () => {
        const location: NativeLocation = history.createLocation({
          pathname: '/the/path'
        })

        expect(location.pathname).toEqual('/the/path')
        expect(location.query).toEqual(createQuery({}))
        expect(location.search).toEqual('')
      })

      it('works with explicit undefined values in query', () => {
        const location: NativeLocation = history.createLocation({
          pathname: '/the/path',
          query: { the: undefined }
        })

        expect(location.pathname).toEqual('/the/path')
        expect(location.query).toEqual(createQuery({ the: undefined }))
        expect(location.search).toEqual('')
      })
    })

    describe('in createHref', () => {
      it('works', () => {
        expect(
          stripHash(history.createHref({
            pathname: '/the/path',
            query: { the: 'query value' }
          }))
        ).toEqual('/the/path?the=query+value')
      })
    })
  })

  describe('custom query serialization', () => {
    let history
    beforeEach(() => {
      history = useQueries(createHistory)({
        parseQueryString: () => ({
          PARSE_QUERY_STRING: 'PARSE_QUERY_STRING'
        }),
        stringifyQuery: () => 'STRINGIFY_QUERY'
      })
    })

    describe('in push', () => {
      it('works', (done: Done) => {
        const steps: Step[] = [
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.query).toEqual({
              PARSE_QUERY_STRING: 'PARSE_QUERY_STRING'
            })
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(CH.Actions.POP)
            expect(location.key).toBeNull()

            history.push({
              pathname: '/home',
              query: { the: 'query' },
              state: { the: 'state' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?STRINGIFY_QUERY')
            expect(location.query).toEqual({
              PARSE_QUERY_STRING: 'PARSE_QUERY_STRING'
            })
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(CH.Actions.PUSH)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })
    })

    describe('in replace', () => {
      it('works', (done: Done) => {
        const steps: Step[] = [
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/')
            expect(location.search).toEqual('')
            expect(location.query).toEqual({
              PARSE_QUERY_STRING: 'PARSE_QUERY_STRING'
            })
            expect(location.state).toBeUndefined()
            expect(location.action).toEqual(CH.Actions.POP)
            expect(location.key).toBeNull()

            history.replace({
              pathname: '/home',
              query: { the: 'query' },
              state: { the: 'state' }
            })
          },
          (location: NativeLocation) => {
            expect(location.pathname).toEqual('/home')
            expect(location.search).toEqual('?STRINGIFY_QUERY')
            expect(location.query).toEqual({
              PARSE_QUERY_STRING: 'PARSE_QUERY_STRING'
            })
            expect(location.state).toEqual({ the: 'state' })
            expect(location.action).toEqual(CH.Actions.REPLACE)
            expect(location.key).toBeDefined()
          }
        ]

        execSteps(steps, history, done)
      })
    })

    describe('in createPath', () => {
      it('works', () => {
        expect(
          history.createPath({
            pathname: '/the/path',
            query: { the: 'query' }
          })
        ).toEqual('/the/path?STRINGIFY_QUERY')
      })

      it('does not strip trailing slash', () => {
        expect(
          history.createPath({
            pathname: '/the/path/',
            query: { the: 'query' }
          })
        ).toEqual('/the/path/?STRINGIFY_QUERY')
      })

      describe('when the path contains a hash', () => {
        it('puts the query before the hash', () => {
          expect(
            history.createPath({
              pathname: '/the/path',
              hash: '#the-hash',
              query: { the: 'query' }
            })
          ).toEqual('/the/path?STRINGIFY_QUERY#the-hash')
        })
      })

      describe('when there is already an existing search', () => {
        it('overwrites the existing search', () => {
          expect(
            history.createPath({
              pathname: '/the/path',
              search: '?a=one',
              query: { the: 'query' }
            })
          ).toEqual('/the/path?STRINGIFY_QUERY')
        })
      })
    })

    describe('in createHref', () => {
      it('works', () => {
        expect(
          stripHash(history.createHref({
            pathname: '/the/path',
            query: { the: 'query' }
          }))
        ).toEqual('/the/path?STRINGIFY_QUERY')
      })
    })
  })
}

export default describeQueries
