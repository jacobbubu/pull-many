import * as pull from 'pull-stream'
import many from '../src/'
import { rand, flatten, compare, partial, delay, noDelay, error } from './utils'

function tests(name: string, all: any[], async?: boolean) {
  const maybeDelay = async ? delay : noDelay

  const pullValues = (ary: any[]) => pull.values(ary)

  it(name + ' simple', () => {
    pull(
      many(all.map(pullValues).map(maybeDelay)),
      pull.collect(function(_, ary) {
        // verify everything is there.
        expect(ary.sort(compare)).toEqual(flatten(all).sort(compare))

        // check that the result is in the correct partial order.
        partial(ary)
      })
    )
  })

  it(name + ' abort', () => {
    const aborted: boolean[] = []
    pull(
      many(
        all
          .map(function(ary, i) {
            return pull(pull.values(ary), function(read) {
              return function(abort, cb) {
                aborted[i] = true
                read(abort, function(end, data) {
                  if (end) {
                    aborted[i] = true
                  }
                  cb(end, data)
                })
              }
            })
          })
          .map(maybeDelay)
      ),
      pull.take(10),
      pull.collect(function(_, ary) {
        expect(aborted).toEqual(
          all.map(function() {
            return true
          })
        )
        partial(ary)
      })
    )
  })
}

describe('main', () => {
  tests('3 items', [rand('a', 7), rand('b', 5), rand('c', 5)])
  tests('1 items', [rand('a', 7)])
  tests('empty', [])
  tests('3 items', [rand('a', 7), rand('b', 5), rand('c', 5)], true)
  tests('1 items', [rand('a', 7)], true)
  tests('empty', [], true)

  it('a stream errors', () => {
    const err = new Error('test-error')
    const aborted: pull.Abort[] = []

    function check(read: pull.Source<any>, i: number) {
      return function(abort: pull.Abort, cb: pull.SourceCallback<any>) {
        aborted[i] = true
        read(abort, function(end, data) {
          if (end) {
            aborted[i] = true
          }
          cb(end, data)
        })
      }
    }

    pull(
      many([check(pull.values(rand('a', 5)), 0), check(pull.values(rand('b', 4)), 1), error(err)]),
      pull.collect(function(_, ary) {
        expect(aborted).toEqual([true, true])
      })
    )
  })
})
