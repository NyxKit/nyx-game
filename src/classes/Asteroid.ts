import type { OnDestroyEvent } from '@/types'
import { clamp, getRandomBetween } from 'nyx-kit/utils'
import type { GameObjects } from 'phaser'
import { v4 as uuidv4 } from 'uuid'

interface AsteroidOptions {
  maxSpeed?: number
  isLarge?: boolean
  onDestroy: OnDestroyEvent
}

export default class Asteroid implements AsteroidOptions {
  public id: string
  public sprite: GameObjects.Image
  private _hp: number = 1
  private maxHp: number = 1
  public maxSpeed = 3
  public minSpeed = 2
  public isLarge = false
  public onDestroy: OnDestroyEvent
  private scene: Phaser.Scene
  private key: string
  private size = 1
  private angle: number = 0

  constructor (scene: Phaser.Scene, options: AsteroidOptions) {
    this.id = uuidv4()
    this.key = `asteroid/${getRandomBetween(1, 6)}`
    this.scene = scene
    this.maxSpeed = (options.maxSpeed ?? 1) * 3
    this.isLarge = options.isLarge ?? false
    this.size = this.isLarge ? getRandomBetween(2, 4, 0.5) * 2 : getRandomBetween(2, 4, 0.5)
    this.hp = this.isLarge ? 50 : 25
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
    // const redTint = 0x7B3636 // Dark red blended with black
    // const yellowTint = 0xFFFFC0 // Pale yellow blended with white
    const orangeTint = 0xFFD580 // Soft orange-yellow blend
    const whiteTint = 0xFFFFFF // Base white color
    
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

  private get speed () {
    const healthRatio = this.hp / this.maxHp
    const speed = this.minSpeed + ((this.maxSpeed - this.minSpeed) * healthRatio)
    return clamp(speed, this.minSpeed, this.maxSpeed)
  }

  private get velocity () {
    return {
      x: -this.speed * Math.cos(this.angle),
      y: this.speed * Math.sin(this.angle)
    }
  }

  create () {
    const src = this.scene.textures.get(this.key).getSourceImage()

    // 75% chance of spawning on right vs top
    const isSpawnOnRight = Math.random() < 0.75

    let startX: number
    let startY: number
    
    if (isSpawnOnRight) {
      // Spawn on right side with random Y position and angle between -15 and 15 degrees
      startX = this.scene.scale.width + src.width
      startY = getRandomBetween(0, this.scene.scale.height - src.height)
      this.angle = getRandomBetween(-15, 15) * Math.PI / 180 // Convert to radians
    } else {
      // Spawn on top with random angle between 15-45 degrees
      startX = getRandomBetween(this.scene.scale.width / 2, this.scene.scale.width) + src.width
      startY = -src.height
      this.angle = getRandomBetween(15, 45) * Math.PI / 180 // Convert to radians
    }

    return this.scene.add
      .image(startX, startY, this.key)
      .setScale(this.size)
      .setDepth(100)
  }

  update () {
    this.sprite.x += this.velocity.x
    this.sprite.y += this.velocity.y
    this.sprite.rotation += 0.01

    const padding = 50

    const shouldDestroy = this.sprite.x < -this.sprite.width - padding
      || this.sprite.y > this.scene.scale.height + this.sprite.height + padding

    if (shouldDestroy) this.destroy()
  }

  destroy (isDestroyedByPlayer: boolean = false) {
    const position = { x: this.sprite.x, y: this.sprite.y }
    this.onDestroy(this.id, { isDestroyedByPlayer, position, size: this.size, isLarge: this.isLarge })
    const { x, y } = { x: this.sprite.x, y: this.sprite.y }
    this.sprite.destroy()

    const explosion = this.scene.add.sprite(x, y, 'explosion/md')
      .setScale(this.size * 0.5)
      .setDepth(100)
    explosion.anims.play('explosion/md')
      .once('animationcomplete', () => explosion.destroy())
  }
}

