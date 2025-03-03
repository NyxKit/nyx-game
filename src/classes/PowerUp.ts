import type { GameScene } from '@/scenes'
import { PowerUpType, PowerUpTypeMap, type OnDestroyEvent } from '@/types'
import { getRandomFromArray } from 'nyx-kit/utils'
import type { GameObjects } from 'phaser'
import { v4 as uuidv4 } from 'uuid'

interface PowerUpOptions {
  type: PowerUpType
  position: { x: number; y: number }
  speed: number
  onDestroy: OnDestroyEvent
}

export default class PowerUp implements PowerUpOptions {
  private scene: GameScene
  private key: string
  public position: { x: number; y: number }
  public onDestroy: OnDestroyEvent
  public id: string = uuidv4()
  public type: PowerUpType = PowerUpType.Hp
  public sprite: GameObjects.Image
  public speed: number

  constructor (scene: GameScene, options?: PowerUpOptions) {
    this.scene = scene
    this.type = options?.type ?? PowerUpType.Hp
    this.key = getRandomFromArray(PowerUpTypeMap[this.type])
    this.position = options?.position ?? { x: 0, y: 0 }
    this.sprite = this.create()
    this.speed = options?.speed ?? 5
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
    const threshold = 300

    // Only move if within range
    if (distance < threshold) {
      const vx = (dx / distance) * this.speed * 3
      const vy = (dy / distance) * this.speed * 3
      
      this.sprite.x += vx
      this.sprite.y += vy
    } else {
      this.sprite.x -= this.speed * 3
    }
  }

  destroy (isDestroyedByPlayer: boolean = false) {
    this.onDestroy(this.id, { isDestroyedByPlayer, type: this.type, position: this.position })
    this.sprite.destroy()
  }
}
