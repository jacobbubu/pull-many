# @jacobbubu/pull-many

[![Build Status](https://travis-ci.org/jacobbubu/pull-many.svg)](https://travis-ci.org/jacobbubu/pull-many)
[![Coverage Status](https://coveralls.io/repos/github/jacobbubu/pull-many/badge.svg)](https://coveralls.io/github/jacobbubu/pull-many)
[![npm](https://img.shields.io/npm/v/@jacobbubu/pull-many.svg)](https://www.npmjs.com/package/@jacobbubu/pull-many/)

> Rewritten [pull-many](https://github.com/pull-stream/pull-many) in typescript for personal study.

## Usage

```ts
import * as pull from 'pull-stream'
import many from 'pull-many'

pull(
  many([pull.values([1, 2, 3]), pull.values([1, 3, 5]), pull.values([2, 4, 6])]),
  pull.collect(function(err, ary) {
    if (err) throw err
    console.log(ary)
    //=> [1, 1, 2, 2, 3, 4, 3, 5, 6]
  })
)
```
