import * as pull from 'pull-stream'
import many from '../src'

pull(
  many([pull.values([1, 2, 3]), pull.values([1, 3, 5]), pull.values([2, 4, 6])]),
  pull.collect(function(err, ary) {
    if (err) throw err
    console.log(ary)
  })
)
