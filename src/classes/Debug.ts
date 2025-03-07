import type { KeyDict } from 'nyx-kit/types'

export default class Debug {
  private _isEnabled = false
  private _isCollisionDisabled = false
  private _hasInfiniteEnergy = true
  private _isImmortal = true

  constructor () {
    const data = JSON.parse(localStorage.getItem('debug') ?? '{}')
    this._isEnabled = false
    this._isCollisionDisabled = this.load(data, '_isCollisionDisabled')
    this._hasInfiniteEnergy = this.load(data, '_hasInfiniteEnergy')
    this._isImmortal = this.load(data, '_isImmortal')
  }

  private load (data: KeyDict<boolean>, key: string): boolean {
    if (data[key] === undefined) return !!this[key as keyof this]
    else return data[key]
  }

  get isEnabled () {
    return this._isEnabled
  }

  set isEnabled (value: boolean) {
    this._isEnabled = value
    this.save()
  }

  get isCollisionDisabled () {
    return this.isEnabled && this._isCollisionDisabled
  }

  set isCollisionDisabled (value: boolean) {
    this._isCollisionDisabled = value
    this.save()
  }

  get hasInfiniteEnergy () {
    return this.isEnabled && this._hasInfiniteEnergy
  }

  set hasInfiniteEnergy (value: boolean) {
    this._hasInfiniteEnergy = value
    this.save()
  }

  get isImmortal () {
    return this.isEnabled && this._isImmortal
  }

  set isImmortal (value: boolean) {
    this._isImmortal = value
    this.save()
  }

  private save () {
    localStorage.setItem('debug', JSON.stringify(this))
  }
}
