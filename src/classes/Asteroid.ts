import { getRandomBetween } from 'nyx-kit/utils'
import type { GameObjects } from 'phaser'
import { v4 as uuidv4 } from 'uuid'

interface AsteroidOptions {
  speed?: number
  onDestroy?: (id: string) => void
}

export default class Asteroid {
  public id: string
  public sprite: GameObjects.Image
  private velocity: { x: number; y: number } = { x: 1, y: 1 }
  private scene: Phaser.Scene
  private key: string
  private speed = 3
  private onDestroy: (id: string) => void

  constructor (scene: Phaser.Scene, options: AsteroidOptions) {
    this.id = uuidv4()
    this.key = `asteroid/${getRandomBetween(1, 6)}`
    this.scene = scene
    this.speed *= options.speed ?? 1
    this.sprite = this.create()
    this.onDestroy = options.onDestroy ?? (() => {})
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
      const angle = getRandomBetween(-15, 15) * Math.PI / 180 // Convert to radians
      this.velocity = {
        x: -this.speed * Math.cos(angle),
        y: this.speed * Math.sin(angle)
      }
    } else {
      // Spawn on top with random angle between 15-45 degrees
      startX = getRandomBetween(this.scene.scale.width / 2, this.scene.scale.width) + src.width
      startY = -src.height
      const angle = getRandomBetween(15, 45) * Math.PI / 180 // Convert to radians
      this.velocity = {
        x: -this.speed * Math.cos(angle),
        y: this.speed * Math.sin(angle)
      }
    }

    return this.scene.add
      .image(startX, startY, this.key)
      .setScale(3)
      .setDepth(100)
  }

  update () {
    this.sprite.x += this.velocity.x
    this.sprite.y += this.velocity.y
    this.sprite.rotation += 0.01

    const shouldDestroy = this.sprite.x < -this.sprite.width
      || this.sprite.y > this.scene.scale.height + this.sprite.height

    if (shouldDestroy) this.destroy()
  }

  destroy () {
    this.sprite.destroy()
    this.onDestroy(this.id)
  }
}

