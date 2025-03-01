import { Scene, Tweens } from 'phaser'
import { EventBus } from '@/classes/EventBus'
import GameControls from '@/classes/GameControls'
import Player from '@/classes/Player'
import Background from '@/classes/Background'

export class GameScene extends Scene {
  private playerTween: Tweens.Tween | null = null
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

  changeScene () {
    if (this.playerTween) {
      this.playerTween.stop()
      this.playerTween = null
    }

    this.scene.start('GameOver')
  }

  idlePlayer (vueCallback: ({ x, y }: { x: number, y: number }) => void) {
    // if (this.playerTween) {
    //   if (this.playerTween.isPlaying()) {
    //     this.playerTween.pause()
    //   } else {
    //     this.playerTween.play()
    //   }
    // } else {
    //   this.playerTween = this.player?.idle(vueCallback) ?? null
    // }
  }

  update () {
    this.background?.update()
    this.player?.update()
  }
}
