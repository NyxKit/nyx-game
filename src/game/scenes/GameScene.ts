import { Scene, Tweens } from 'phaser'
import { EventBus } from '@/classes/EventBus'
import GameControls from '@/classes/GameControls'
import Player from '@/classes/Player'
import Background from '@/classes/Background'

export class GameScene extends Scene {
  private player: Player | null = null
  private background: Background | null = null
  private controls: GameControls | null = null

  constructor () {
    super('Game')
  }

  create () {
    if (!this.input.keyboard) {
      throw new Error('No keyboard input found')
    }

    this.controls = new GameControls(this.input.keyboard)
    this.background = new Background(this, this.controls)
    this.player = new Player(this, this.controls)

    EventBus.emit('current-scene-ready', this)
  }

  update () {
    this.background?.update()
    this.player?.update()
  }
}
