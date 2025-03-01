import { createTiledImage } from '@/utils'
import type { GameObjects, Scene } from 'phaser'
import type GameControls from './GameControls'

export default class Background {
  private scene: Scene
  private controls: GameControls
  private bgDust: GameObjects.TileSprite | null = null
  private bgStars: GameObjects.TileSprite | null = null
  private bgNebulae: GameObjects.TileSprite | null = null
  private bgPlanets: GameObjects.TileSprite | null = null

  private velocity: number = 0
  private maxVelocity: number = 2
  private acceleration: number = 0.1
  private deceleration: number = 0.025

  constructor(scene: Scene, controls: GameControls) {
    this.scene = scene
    this.controls = controls
    this.bgDust = createTiledImage(scene, 'bg_dust', { depth: 10, alpha: 0.5 })
    this.bgNebulae = createTiledImage(scene, 'bg_nebulae', { depth: 20, alpha: 0.5 })
    this.bgStars = createTiledImage(scene, 'bg_stars', { depth: 30, alpha: 1 })
    this.bgPlanets = createTiledImage(scene, 'bg_planets', { depth: 40, alpha: 1 })
  }

  update () {
    if (!this.bgDust || !this.bgNebulae || !this.bgStars || !this.bgPlanets) return

    let baseSpeed = 0.5

    if (this.controls?.left) {
      this.velocity = Math.max(this.velocity - this.acceleration, -this.maxVelocity)
    } else if (this.controls?.right) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity)
    } else {
      if (this.velocity > 0) {
        this.velocity = Math.max(0, this.velocity - this.deceleration)
      } else if (this.velocity < 0) {
        this.velocity = Math.min(0, this.velocity + this.deceleration)
      }
    }

    const scrollSpeed = baseSpeed + this.velocity

    this.bgDust.tilePositionX += scrollSpeed * 0.25
    this.bgNebulae.tilePositionX += scrollSpeed * 0.25
    this.bgStars.tilePositionX += scrollSpeed * 0.275
    this.bgPlanets.tilePositionX += scrollSpeed * 0.3
  }
}
