import * as pull from 'pull-stream'
import many from '../src/'

describe('add', () => {
  it('add after stream creation', done => {
    const m = many()

    pull(
      m,
      pull.collect(function(err, ary) {
        expect(err).toBeFalsy()
        expect(ary.sort()).toEqual([1, 2, 3, 4, 5, 6])
        done()
      })
    )
    m.add(pull.values([1, 2, 3]))
    m.add(pull.values([4, 5, 6]))
    m.add()
  })

  it('add after stream creation - more', done => {
    const m = many()

    pull(
      m,
      pull.collect(function(err, ary) {
        expect(err).toBeFalsy()
        expect(ary.sort()).toEqual([])
        done()
      })
    )
    m.add()
  })

  it('do not close inputs until the last minute', done => {
    const m = many()
    const seen: number[] = []

    pull(
      m,
      pull.through(function(data) {
        // wait until the last message to end inputs.
        seen.push(data)
        if (data >= 6) {
          m.cap()
        }
      }),
      pull.collect(function(err, ary) {
        expect(err).toBeFalsy()
        expect(ary.sort()).toEqual([1, 2, 3, 4, 5, 6])
        expect(seen.sort()).toEqual([1, 2, 3, 4, 5, 6])
        done()
      })
    )
    m.add(pull.values([1, 2, 3]))
    m.add(pull.values([4, 5, 6]))
  })
})
