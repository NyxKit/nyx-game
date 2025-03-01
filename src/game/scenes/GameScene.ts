import { GameObjects, Scene } from 'phaser'
import { EventBus } from '@/classes/EventBus'
import { createTiledImage } from '@/utils'

export class GameScene extends Scene {
  bgDust: GameObjects.TileSprite | null = null
  bgStars: GameObjects.TileSprite | null = null
  bgNebulae: GameObjects.TileSprite | null = null
  bgPlanets: GameObjects.TileSprite | null = null
  player: GameObjects.Image | null = null
  title: GameObjects.Text | null = null
  playerTween: Phaser.Tweens.Tween | null = null
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  private w: number = 0
  private h: number = 0
  private velocity: number = 0
  private maxVelocity: number = 2
  private acceleration: number = 0.1
  private deceleration: number = 0.025

  constructor () {
    super('Game')
  }

  create () {
    this.w = this.scale.width
    this.h = this.scale.height
    this.setupBackground()
  
    this.player = this.add.image(50, this.h * 0.5 - 100, 'player')
      .setOrigin(0, 0).setDepth(100)
      .setScrollFactor(0)

    this.cursors = this.input.keyboard?.createCursorKeys() ?? null

    EventBus.emit('current-scene-ready', this)
  }

  setupBackground () {
    this.bgDust = createTiledImage(this, 'bg_dust', { depth: 10, alpha: 0.5 })
    this.bgNebulae = createTiledImage(this, 'bg_nebulae', { depth: 20, alpha: 0.5 })
    this.bgStars = createTiledImage(this, 'bg_stars', { depth: 30, alpha: 1 })
    this.bgPlanets = createTiledImage(this, 'bg_planets', { depth: 40, alpha: 1 })
  }

  changeScene () {
    if (this.playerTween) {
      this.playerTween.stop()
      this.playerTween = null
    }

    this.scene.start('GameOver')
  }

  idlePlayer (vueCallback: ({ x, y }: { x: number, y: number }) => void) {
    if (this.playerTween) {
      if (this.playerTween.isPlaying()) {
        this.playerTween.pause()
      } else {
        this.playerTween.play()
      }
    } else {
      this.playerTween = this.tweens.add({
        targets: this.player,
        x: { value: 60, duration: 3000, ease: 'Back.easeInOut' },
        y: { value: this.h * 0.5 - 80, duration: 1500, ease: 'Sine.easeInOut' },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (!vueCallback) return
          vueCallback({
            x: Math.floor(this.player!.x),
            y: Math.floor(this.player!.y)
          })
        }
      })
    }
  }

  update () {
    this.updateBackground()
  }

  updateBackground () {
    if (!this.bgDust || !this.bgNebulae || !this.bgStars || !this.bgPlanets) return

    const baseSpeed = 0.5

    if (this.cursors?.left.isDown) {
      this.velocity = Math.max(this.velocity - this.acceleration, -this.maxVelocity)
    } else if (this.cursors?.right.isDown) {
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
