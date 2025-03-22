import config from '@/config'
import type { GameScene } from '@/scenes'
import { UNIT } from '@/scenes/GameScene'
import type { OnDestroyEvent } from '@/types'
import { clamp, getRandomBetween } from 'nyx-kit/utils'
import { Physics } from 'phaser'
import { v4 as uuidv4 } from 'uuid'

interface AsteroidOptions {
  maxSpeed?: number
  isLarge?: boolean
  onDestroy: OnDestroyEvent
}

export default class Asteroid {
  public id: string
  public sprite: Physics.Arcade.Sprite
  private _hp: number = 1
  private maxHp: number = 1
  public maxSpeed = 3 * UNIT
  public minSpeed = config.asteroid.minSpeed * UNIT
  public isLarge = false
  public onDestroy: OnDestroyEvent
  private scene: GameScene
  private key: string
  private size = 1
  private angle: number = 0

  constructor (scene: GameScene, options: AsteroidOptions) {
    this.id = uuidv4()
    this.key = `asteroid/${getRandomBetween(1, 6)}`
    this.scene = scene
    this.maxSpeed = (options.maxSpeed ?? 1) * config.asteroid.maxSpeedMultiplier * UNIT
    this.isLarge = options.isLarge ?? false
    this.size = this.isLarge
      ? getRandomBetween(config.asteroid.large.size[0], config.asteroid.large.size[1], 0.1)
      : getRandomBetween(config.asteroid.small.size[0], config.asteroid.small.size[1], 0.1)
    this.hp = this.isLarge ? config.asteroid.large.hp : config.asteroid.small.hp
    this.maxHp = this.hp
    this.sprite = this.create()
    this.onDestroy = options.onDestroy
  }

  public get hp () {
    return this._hp
  }

  public set hp (value: number) {
    this._hp = value
    if (value <= 0) {
      this.destroy(true)
      return
    }
    if (!this.sprite) return
    // Calculate red tint based on remaining HP percentage
    const hpPercentage = this._hp / this.maxHp
    const orangeTint = 0xFFD580
    const whiteTint = 0xFFFFFF

    // Blend between white and red based on HP
    const tint = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(orangeTint),
      Phaser.Display.Color.ValueToColor(whiteTint),
      100,
      hpPercentage * 100
    )

    // Apply the tint to the sprite
    this.sprite.setTint(Phaser.Display.Color.GetColor(tint.r, tint.g, tint.b))
  }

  public get damage () {
    const maxDamage = this.isLarge ? config.asteroid.large.damage : config.asteroid.small.damage
    const hpRatio = this.hp / this.maxHp
    return maxDamage * hpRatio
  }

  private get speed () {
    const hpRatio = this.hp / this.maxHp
    const speed = this.minSpeed + ((this.maxSpeed - this.minSpeed) * hpRatio)
    return clamp(speed, this.minSpeed, this.maxSpeed) * 60 // Multiply by 60 for physics system
  }

  create () {
    // 75% chance of spawning on right vs top/bottom
    const isSpawnOnRight = Math.random() < 0.75

    let startX: number
    let startY: number
    let velocityX: number
    let velocityY: number

    if (isSpawnOnRight) {
      // Spawn on right side with random Y position
      startX = this.scene.scale.width + 100 // Add padding to ensure it's off screen
      startY = getRandomBetween(0, this.scene.scale.height)
      this.angle = getRandomBetween(-15, 15) * Math.PI / 180
    } else {
      const isSpawnOnTop = Math.random() < 0.5
      if (isSpawnOnTop) {
        startX = getRandomBetween(this.scene.scale.width / 2, this.scene.scale.width)
        startY = -100 // Add padding to ensure it's off screen
        this.angle = getRandomBetween(15, 30) * Math.PI / 180
      } else {
        startX = getRandomBetween(0, this.scene.scale.width)
        startY = this.scene.scale.height + 100 // Add padding to ensure it's off screen
        this.angle = getRandomBetween(-30, -15) * Math.PI / 180
      }
    }

    // Create physics sprite
    const sprite = this.scene.physics.add.sprite(startX, startY, this.key)
      .setScale(this.size * UNIT)
      .setDepth(100)

    // Calculate velocity based on angle and speed
    velocityX = -Math.cos(this.angle) * this.speed
    velocityY = Math.sin(this.angle) * (this.speed * 0.5)

    // Set initial velocity
    sprite.setVelocity(velocityX, velocityY)

    return sprite
  }

  update (dt: number) {
    // Update rotation
    this.sprite.rotation += config.asteroid.rotationSpeed * dt

    const padding = 500
    const shouldDestroy = this.sprite.x < -this.sprite.width - padding
      || this.sprite.y > this.scene.scale.height + this.sprite.height + padding

    if (shouldDestroy) this.destroy()
  }

  destroy (isDestroyedByPlayer: boolean = false) {
    const position = { x: this.sprite.x, y: this.sprite.y }
    this.onDestroy(this.id, { isDestroyedByPlayer, position, size: this.size, isLarge: this.isLarge })
    const { x, y } = position

    if (isDestroyedByPlayer) {
      this.scene.audio?.sfx.asteroidExplosion?.play()
    }

    const explosion = this.scene.add.sprite(x, y, 'explosion/md')
      .setScale(this.size * 0.5 * UNIT)
      .setDepth(100)
    explosion.anims.play('explosion/md')
      .once('animationcomplete', () => explosion.destroy())

    this.sprite.destroy()
  }
}

