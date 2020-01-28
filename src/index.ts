import { Source, Abort, SourceCallback, EndOrError } from 'pull-stream'
import { StreamState } from './stream-state'

function create<T>(stream: Source<T>) {
  return new StreamState(stream)
}

export default function(ary?: Source<any>[]) {
  // capped indicates that should we end the big stream when all the sub streams end.
  let capped = Array.isArray(ary)
  const inputs = (ary || []).map(create)

  let startPos = 0
  let abort: Abort
  let cb: SourceCallback<any> | undefined

  function clean() {
    let len = inputs.length
    // iterate backwards so that we can remove items.
    while (len--) {
      if (inputs[len].ended) {
        inputs.splice(len, 1)
      }
    }
  }

  function check() {
    if (!cb) {
      return
    }

    // remove ended stream
    clean()

    const len = inputs.length
    let _cb = cb
    if (len === 0 && (abort || capped)) {
      // no more sub streams, call downstream with abortion
      cb = undefined
      _cb(abort || true)
      return
    }

    // scan the inputs to check whether there is one we can use.
    for (let j = 0; j < len; j++) {
      const current = inputs[(startPos + j) % len]
      if (current.ready && !current.ended) {
        const data = current.popData()

        // next time, we send the data from next ready sub-stream
        startPos++
        cb = undefined
        return _cb(null, data)
      }
    }
  }

  const next = () => {
    let len = inputs.length
    while (len--) {
      ;(function(current) {
        // read the next item if we aren't already

        if (len > inputs.length) {
          throw new Error('this should never happen')
        }

        if (current.reading || current.ended || current.ready) {
          return
        }

        current.reading = true

        // read 里面用 sync 判断是同步进入还是异步进入
        let sync = true
        current.read(abort, function next(endOrError, data) {
          current.hasRead(data)

          if (endOrError === true || abort) {
            // end normally, don't stop big stream
            current.end()
          } else if (endOrError) {
            // ended with error, abort big stream
            current.end(endOrError)
            abort = endOrError
          }

          // the abort may come between read and callback
          // we need to handle this situation to prevent leave current stream along
          if (abort && !endOrError) {
            current.read(abort, next)
          }

          if (!sync) {
            // checking for asynchronous entering
            check()
          }
        })
        sync = false
      })(inputs[len])

      // scan the feed
      check()
    }
  }

  function read(_abort: Abort, _cb: SourceCallback<any>) {
    abort = abort || _abort
    cb = _cb
    next()
  }

  read.add = function(stream: Source<any>) {
    if (!stream) {
      // the stream will now end when all the streams end.
      capped = true
      // we just changed state, so we may need to cb
      return next()
    }
    inputs.push(create(stream))
    next()
  }

  return read
}
