import { createTiledImage } from '@/utils'
import type { GameObjects, Scene } from 'phaser'
import type GameControls from './GameControls'
import useGameStore from '@/stores/game'

export default class Background {
  private scene: Scene
  private controls: GameControls
  private store = useGameStore()

  private bgDust: GameObjects.TileSprite
  private bgStars: GameObjects.TileSprite
  private bgNebulae: GameObjects.TileSprite
  private bgPlanets: GameObjects.TileSprite
  
  private baseSpeed: number = 1.5
  private velocity: number = this.baseSpeed
  private maxVelocity: number = 2
  private acceleration: number = 0.05
  private deceleration: number = 0.025

  constructor(scene: Scene, controls: GameControls) {
    this.scene = scene
    this.controls = controls
    this.bgDust = createTiledImage(scene, 'bg_dust', { depth: 10, alpha: 0.5 })
    this.bgNebulae = createTiledImage(scene, 'bg_nebulae', { depth: 20, alpha: 0.5 })
    this.bgStars = createTiledImage(scene, 'bg_stars', { depth: 30, alpha: 1 })
    this.bgPlanets = createTiledImage(scene, 'bg_planets', { depth: 40, alpha: 1 })
  }

  update() {
    // When pressing left, decelerate towards base speed
    // When pressing right, accelerate up to max speed
    // When no input, gradually return to base speed
    // if (this.controls.left) {
    //   this.velocity = Math.max(this.baseSpeed, this.velocity - this.deceleration)
    // } else if (this.controls.right) {
    //   this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity)
    // } else if (this.velocity > this.baseSpeed) {
    //   this.velocity = Math.max(this.baseSpeed, this.velocity - this.deceleration)
    // } 

    this.velocity = Math.max(this.baseSpeed, this.velocity - this.deceleration)

    // Apply scrolling with different parallax depths
    this.bgDust.tilePositionX += this.velocity * 0.25
    this.bgNebulae.tilePositionX += this.velocity * 0.25
    this.bgStars.tilePositionX += this.velocity * 0.275
    this.bgPlanets.tilePositionX += this.velocity * 0.3
  }
}
