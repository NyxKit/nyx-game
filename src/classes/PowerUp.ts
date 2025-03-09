import config from '@/config'
import type { GameScene } from '@/scenes'
import { useGameStore } from '@/stores'
import { PowerUpType, type OnDestroyEvent } from '@/types'
import { getRandomBetween, getRandomFromArray } from 'nyx-kit/utils'
import type { GameObjects } from 'phaser'
import { v4 as uuidv4 } from 'uuid'

interface PowerUpOptions {
  type?: PowerUpType
  position: { x: number; y: number }
  speed: number
  isLarge: boolean
  onDestroy: OnDestroyEvent
}

export default class PowerUp implements PowerUpOptions {
  private scene: GameScene
  private store = useGameStore()
  public position: { x: number; y: number }
  public onDestroy: OnDestroyEvent
  public id: string = uuidv4()
  public type: PowerUpType = PowerUpType.EnergySmall
  public sprite: GameObjects.Image
  public speed: number
  public isLarge: boolean = false

  constructor (scene: GameScene, options?: PowerUpOptions) {
    this.scene = scene
    this.type = options?.type ?? this.getRandomType(options?.isLarge ?? false)
    this.position = options?.position ?? { x: 0, y: 0 }
    this.sprite = this.create()
    this.speed = options?.speed ?? 5
    this.onDestroy = options?.onDestroy ?? (() => {})
  }

  get key () {
    return this.type
  }

  private getRandomType (isLarge: boolean): PowerUpType {
    if (!isLarge) return PowerUpType.EnergySmall
    const energyTypes = [PowerUpType.EnergyMedium, PowerUpType.EnergyMedium, PowerUpType.EnergyMedium, PowerUpType.EnergyLarge]
    const hpTypes = [PowerUpType.HpMedium, PowerUpType.HpMedium, PowerUpType.HpMedium, PowerUpType.HpLarge]
    if (this.store.hp === config.player.hpMax) return getRandomFromArray(energyTypes)
    const ratio = this.store.energy / 100
    return Math.random() > ratio ? getRandomFromArray(energyTypes) : getRandomFromArray(hpTypes)
  }

  create () {
    let scale = 2
    if ([PowerUpType.EnergyMedium, PowerUpType.HpMedium].includes(this.type)) {
      scale = 1.5
    }
    return this.scene.add
      .image(this.position.x, this.position.y, this.key)
      .setOrigin(0.5, 0.5)
      .setRotation(getRandomBetween(0, Math.PI * 2))
      .setScale(scale)
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

    this.sprite.rotation += config.powerUp.rotationSpeed

    const shouldDestroy = this.sprite.x < -this.sprite.width
      || this.sprite.y > this.scene.scale.height + this.sprite.height

    if (shouldDestroy) this.destroy()
  }

  destroy (isDestroyedByPlayer: boolean = false) {
    this.onDestroy(this.id, { isDestroyedByPlayer, type: this.type, position: this.position })
    this.sprite.destroy()
  }
}
