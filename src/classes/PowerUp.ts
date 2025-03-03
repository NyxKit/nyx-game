import type { GameScene } from '@/scenes'
import { DefaultPowerUpKey, PowerUpType, PowerUpTypeMap, type OnDestroyEvent } from '@/types'
import { getRandomFromArray } from 'nyx-kit/utils'
import type { GameObjects } from 'phaser'
import { v4 as uuidv4 } from 'uuid'

interface PowerUpOptions {
  type: PowerUpType
  position: { x: number; y: number }
  onDestroy: OnDestroyEvent
}

export default class PowerUp {
  private scene: GameScene
  private key: string
  private position: { x: number; y: number }
  private onDestroy: OnDestroyEvent
  public id: string = uuidv4()
  public type: PowerUpType = PowerUpType.Default
  public sprite: GameObjects.Image

  // If key is true, the random powerup will be selected
  // If key is a string, the powerup will be the one specified

  constructor (scene: GameScene, options?: PowerUpOptions) {
    this.scene = scene
    this.type = options?.type ?? PowerUpType.Default
    this.key = getRandomFromArray(PowerUpTypeMap[this.type])
    this.position = options?.position ?? { x: 0, y: 0 }
    this.sprite = this.create()
    this.onDestroy = options?.onDestroy ?? (() => {})
  }

  create () {
    return this.scene.add
      .image(this.position.x, this.position.y, this.key)
      .setOrigin(0.5, 0.5)
      .setScale(2)
      .setDepth(100)
  }

  update (playerPosition: { x: number; y: number }) {
    const dx = playerPosition.x - this.sprite.x
    const dy = playerPosition.y - this.sprite.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const threshold = (this.key === DefaultPowerUpKey) ? 2000 : 300

    // Only move if within range
    if (distance < threshold) {
      const speed = 5
      const vx = (dx / distance) * speed
      const vy = (dy / distance) * speed
      
      this.sprite.x += vx
      this.sprite.y += vy
    }
  }

  destroy (isDestroyedByPlayer: boolean = false) {
    this.onDestroy(this.id, { isDestroyedByPlayer, type: this.type, position: this.position })
    this.sprite.destroy()
  }
}
