import { GameObjects, Scene } from 'phaser'
import { EventBus } from '@/classes/EventBus'

export class GameScene extends Scene {
  bgDust: GameObjects.Image | null = null
  bgStars: GameObjects.Image | null = null
  bgNebulae: GameObjects.Image | null = null
  bgPlanets: GameObjects.Image | null = null
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
    this.cameras.main.setBounds(0, 0, this.w * 7.5, this.h)

    this.cursors = this.input.keyboard?.createCursorKeys() ?? null

    EventBus.emit('current-scene-ready', this)
  }

  setupBackground () {
    const parallax = 0.25
    this.bgDust = this.add.image(0, 0, 'bg_dust').setOrigin(0, 0)
      .setDisplaySize(this.w * 7.5, this.h + 20)
      .setScrollFactor(parallax)
    this.bgNebulae = this.add.image(0, 0, 'bg_nebulae').setOrigin(0, 0)
      .setDisplaySize(this.w * 7.5, this.h + 20)
      .setScrollFactor(parallax * 1.2)
    this.bgStars = this.add.image(0, 0, 'bg_stars').setOrigin(0, 0)
      .setDisplaySize(this.w * 7.5, this.h + 20)
      .setScrollFactor(parallax * 1.3)
    this.bgPlanets = this.add.image(0, 0, 'bg_planets').setOrigin(0, 0)
      .setDisplaySize(this.w * 7.5, this.h + 20)
      .setScrollFactor(parallax * 1.5)
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
    const cam = this.cameras.main
    const speed = 3
    const { x, y } = this.player!.getCenter()

    cam.scrollX += speed

    if (!this.cursors) return

    if (this.cursors.left.isDown) {
      
    } else if (this.cursors.right.isDown) {

    }
    
  }
}
