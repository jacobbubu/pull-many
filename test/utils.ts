import { Source, Abort, SourceCallback, EndOrError } from 'pull-stream'
interface TestData {
  key: string
  value: number
}

function rand(name: string, n: number) {
  const a: TestData[] = []
  let i = 0
  while (n--) {
    a.push({ key: name, value: i++ })
  }
  return a
}

function flatten(ary: any[]) {
  return ary.reduce(function(a, b) {
    return a.concat(b)
  }, [])
}

function compare(a: TestData, b: TestData) {
  return a.value - b.value || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
}

function partial(ary: TestData[]) {
  let latest: Record<string, number> = {}
  ary.forEach(function(v) {
    if (latest[v.key]) {
      expect(latest[v.key]).toBeLessThan(v.value)
    }
    latest[v.key] = v.value
  })
}

function delay(read: Source<any>) {
  return function(abort: Abort, cb: SourceCallback<any>) {
    read(abort, function(end, data) {
      setTimeout(function() {
        cb(end, data)
      }, Math.random() * 20)
    })
  }
}

function noDelay(read: Source<any>) {
  return read
}

function error(err: EndOrError) {
  return function(_: Abort, cb: SourceCallback<any>) {
    cb(err)
  }
}

export { rand, flatten, compare, partial, delay, noDelay, error }
