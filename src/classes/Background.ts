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

  private velocity: number = 1

  constructor(scene: Scene, controls: GameControls) {
    this.scene = scene
    this.controls = controls
    this.bgDust = createTiledImage(scene, 'background/dust', { depth: 10, alpha: 0.5 })
    this.bgNebulae = createTiledImage(scene, 'background/nebulae', { depth: 20, alpha: 0.5 })
    this.bgStars = createTiledImage(scene, 'background/stars', { depth: 30, alpha: 1 })
    this.bgPlanets = createTiledImage(scene, 'background/planets', { depth: 40, alpha: 1 })
  }

  update (dt: number, velocity: number) {
    this.velocity = velocity
    this.bgDust.tilePositionX += this.velocity * 0.25
    this.bgNebulae.tilePositionX += this.velocity * 0.25
    this.bgStars.tilePositionX += this.velocity * 0.275
    this.bgPlanets.tilePositionX += this.velocity * 0.3
  }
}
