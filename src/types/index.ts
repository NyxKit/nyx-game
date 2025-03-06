export * from './database'

import type { KeyDict } from 'nyx-kit/types'

export enum GameState {
  Preload = 'preload',
  Menu = 'menu',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameover',
}

export type OnDestroyEvent = (id: string, options?: KeyDict<any>) => void

export enum PowerUpType {
  HpSmall = 'powerup/hp-small',
  HpMedium = 'powerup/hp-medium',
  HpLarge = 'powerup/hp-large',
  EnergySmall = 'powerup/energy-small',
  EnergyMedium = 'powerup/energy-medium',
  EnergyLarge = 'powerup/energy-large'
}
