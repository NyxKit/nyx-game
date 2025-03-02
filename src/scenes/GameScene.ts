import { Scene } from 'phaser'
import { EventBus } from '@/classes/EventBus'
import GameControls from '@/classes/GameControls'
import Player from '@/classes/Player'
import Background from '@/classes/Background'
import useGameStore from '@/stores/game'
import { clamp } from 'nyx-kit/utils'

export class GameScene extends Scene {
  private controls: GameControls | null = null
  private background: Background | null = null
  private player: Player | null = null
  private store = useGameStore()
  private velocity = 1

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
    this.velocity = 1 + Math.log10(Math.max(1, this.store.score / 1000)) * 2 + Math.pow(this.store.score / 1000, 1.1)
    this.velocity = clamp(this.velocity, 1, 15)

    if (!this.store.isPlaying) {
      this.background?.update(this.velocity)
      return
    }

    if (this.store.isPaused) return

    this.background?.update(this.velocity)
    this.player?.update(this.velocity)
  }
}
