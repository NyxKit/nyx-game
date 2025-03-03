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
  Hp = 'hp',
  Energy = 'energy',
  HpCrystal = 'hp-crystal',
  EnergyCrystal = 'energy-crystal'
}

export const PowerUpTypeMap = {
  [PowerUpType.Energy]: ['powerup/pink0'],
  [PowerUpType.Hp]: ['powerup/blue0'],
  [PowerUpType.HpCrystal]: ['powerup/pink1', 'powerup/pink2'],
  [PowerUpType.EnergyCrystal]: ['powerup/blue1', 'powerup/blue2']
}

