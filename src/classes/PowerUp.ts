import config from '@/config'
import type { GameScene } from '@/scenes'
import { UNIT } from '@/scenes/GameScene'
import { useGameStore } from '@/stores'
import { PowerUpType, type OnDestroyEvent } from '@/types'
import { getRandomBetween, getRandomFromArray } from 'nyx-kit/utils'
import { Physics } from 'phaser'
import { v4 as uuidv4 } from 'uuid'

interface PowerUpOptions {
  type?: PowerUpType
  position: { x: number; y: number }
  speed: number
  isLarge: boolean
  onDestroy: OnDestroyEvent
}

export default class PowerUp {
  private scene: GameScene
  private store = useGameStore()
  public position: { x: number; y: number }
  public onDestroy: OnDestroyEvent
  public id: string = uuidv4()
  public type: PowerUpType = PowerUpType.EnergySmall
  public sprite: Physics.Arcade.Sprite
  public speed: number
  public isLarge: boolean = false
  private attractionRange: number = 300
  private baseSpeed: number = 180 // 3 * 60 for physics system

  constructor (scene: GameScene, options?: PowerUpOptions) {
    this.scene = scene
    this.type = options?.type ?? this.getRandomType(options?.isLarge ?? false)
    this.isLarge = options?.isLarge ?? false
    this.position = options?.position ?? { x: 0, y: 0 }
    this.speed = (options?.speed ?? 5) * 60 // Convert to physics system speed
    this.sprite = this.create()
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

    // Create physics sprite
    const sprite = this.scene.physics.add.sprite(this.position.x, this.position.y, this.key)
      .setOrigin(0.5, 0.5)
      .setRotation(getRandomBetween(0, Math.PI * 2))
      .setScale(scale * UNIT)
      .setDepth(100)

    // Set initial velocity (moving left)
    sprite.setVelocityX(-this.baseSpeed)

    return sprite
  }

  update (dt: number, playerPosition: { x: number; y: number }) {
    const dx = playerPosition.x - this.sprite.x
    const dy = playerPosition.y - this.sprite.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Only move towards player if within range
    if (distance < this.attractionRange) {
      // Calculate normalized direction to player
      const dirX = dx / distance
      const dirY = dy / distance
      
      // Set velocity towards player with increased speed when in range
      this.sprite.setVelocity(
        dirX * this.speed,
        dirY * this.speed
      )
    } else {
      // Move left at base speed when out of range
      this.sprite.setVelocityX(-this.baseSpeed)
      this.sprite.setVelocityY(0)
    }

    // Update rotation
    this.sprite.rotation += config.powerUp.rotationSpeed * dt

    // Check if power-up should be destroyed (off screen)
    const shouldDestroy = this.sprite.x < -this.sprite.width
      || this.sprite.y > this.scene.scale.height + this.sprite.height

    if (shouldDestroy) this.destroy()
  }

  destroy (isDestroyedByPlayer: boolean = false) {
    this.sprite.destroy()
    if (isDestroyedByPlayer && this.type !== PowerUpType.EnergySmall) {
      this.scene.audio?.playSfx('powerUp')
    }
    this.onDestroy(this.id, { isDestroyedByPlayer, type: this.type, position: this.position })
  }
}
