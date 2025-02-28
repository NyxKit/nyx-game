import { GameObjects, Scene } from 'phaser'
import { EventBus } from '@/classes/EventBus'
import useClientStore from '@/stores/client'
import { storeToRefs } from 'pinia'

export class GameScene extends Scene {
  bgDust: GameObjects.Image
  bgStars: GameObjects.Image
  bgNebulae: GameObjects.Image
  bgPlanets: GameObjects.Image
  player: GameObjects.Image
  title: GameObjects.Text
  playerTween: Phaser.Tweens.Tween | null = null

  constructor () {
    super('Game')
  }

  create () {
    const { SCREEN_CENTER, SCREEN_WIDTH, SCREEN_HEIGHT } = storeToRefs(useClientStore())
    this.bgDust = this.add.image(0, -10, 'bg_dust').setOrigin(0, 0)
    this.bgDust.setDisplaySize(SCREEN_WIDTH.value * 7.5, SCREEN_HEIGHT.value + 20)

    this.bgStars = this.add.image(0, 0, 'bg_stars').setOrigin(0, 0)
    this.bgStars.setDisplaySize(SCREEN_WIDTH.value * 7.5, SCREEN_HEIGHT.value + 20)

    this.bgNebulae = this.add.image(0, 0, 'bg_nebulae').setOrigin(0, 0)
    this.bgNebulae.setDisplaySize(SCREEN_WIDTH.value * 7.5, SCREEN_HEIGHT.value + 20)

    this.bgPlanets = this.add.image(0, 0, 'bg_planets').setOrigin(0, 0)
    this.bgPlanets.setDisplaySize(SCREEN_WIDTH.value * 7.5, SCREEN_HEIGHT.value + 20)
  
    this.player = this.add.image(250, SCREEN_CENTER.value.y, 'player').setDepth(100)

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
    const { SCREEN_CENTER } = storeToRefs(useClientStore())
    if (this.playerTween) {
      if (this.playerTween.isPlaying()) {
        this.playerTween.pause()
      } else {
        this.playerTween.play()
      }
    } else {
      this.playerTween = this.tweens.add({
        targets: this.player,
        x: { value: 260, duration: 3000, ease: 'Back.easeInOut' },
        y: { value: SCREEN_CENTER.value.y - 80, duration: 1500, ease: 'Sine.easeInOut' },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (!vueCallback) return
          vueCallback({
            x: Math.floor(this.player.x),
            y: Math.floor(this.player.y)
          })
        }
      })
    }
  }
}
