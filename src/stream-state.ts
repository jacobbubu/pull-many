import { Source, EndOrError } from 'pull-stream'

export class StreamState<T> {
  private _ready = false
  private _reading = false
  private _ended: EndOrError = false
  private _source: Source<T>
  private _data: T | null = null

  constructor(stream: Source<T>) {
    this._source = stream
  }

  hasRead(data: T) {
    this._data = data
    this._ready = true
    this._reading = false
  }

  popData() {
    const data = this._data
    this._ready = false
    this._data = null
    return data
  }

  end(reason?: EndOrError) {
    this._ended = reason === null || reason === undefined ? true : reason
  }

  get ready() {
    return this._ready
  }

  get reading() {
    return this._reading
  }

  set reading(value) {
    this._reading = value
  }

  get ended() {
    return this._ended
  }

  get read() {
    return this._source
  }
}
