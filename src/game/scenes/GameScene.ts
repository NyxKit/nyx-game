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
  w: number = 0
  h: number = 0

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

    const speed = 2
    let scrollSpeed = 0.2
    const modifier = 1

    if (this.cursors?.left.isDown) {
      scrollSpeed -= speed * modifier
    } else if (this.cursors?.right.isDown) {
      scrollSpeed += speed * modifier
    }

    this.bgDust.tilePositionX += scrollSpeed * 0.25
    this.bgNebulae.tilePositionX += scrollSpeed * 0.25
    this.bgStars.tilePositionX += scrollSpeed * 0.275
    this.bgPlanets.tilePositionX += scrollSpeed * 0.3
  }
}
