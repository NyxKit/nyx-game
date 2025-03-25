export * from './database'

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

export interface DestroyOptions {
  isDestroyedByPlayer?: boolean
  position?: { x: number, y: number }
  isLarge?: boolean
  type?: PowerUpType
}

export type OnDestroyEvent = (id: string, options?: DestroyOptions) => void

export enum PowerUpType {
  HpSmall = 'powerup/hp-small',
  HpMedium = 'powerup/hp-medium',
  HpLarge = 'powerup/hp-large',
  EnergySmall = 'powerup/energy-small',
  EnergyMedium = 'powerup/energy-medium',
  EnergyLarge = 'powerup/energy-large'
}
