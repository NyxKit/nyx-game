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
  Default = 'default',
  Energy = 'energy',
  Shield = 'shield'
}

export const PowerUpTypeMap = {
  [PowerUpType.Default]: ['powerup/pink0'],
  [PowerUpType.Energy]: ['powerup/pink1', 'powerup/pink2'],
  [PowerUpType.Shield]: ['powerup/blue1', 'powerup/blue2']
}

export const DefaultPowerUpKey = PowerUpTypeMap[PowerUpType.Default][0]
