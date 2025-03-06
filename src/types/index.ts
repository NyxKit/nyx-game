export * from './database'

import type { KeyDict } from 'nyx-kit/types'

export enum GameState {
  Preload = 'preload',
  Menu = 'menu',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameover',
}

export enum GameMode {
  Normal = 'normal',
  Story = 'story',
  TimeTrial = 'time-trial',
  Battle = 'battle',
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
