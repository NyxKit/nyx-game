import { EventBus } from '@/classes/EventBus'
import useClientStore from '@/stores/client'
import { Scene } from 'phaser'
import { storeToRefs } from 'pinia'

export class GameOverScene extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera | null = null
  background: Phaser.GameObjects.Image | null = null
  gameOverText: Phaser.GameObjects.Text | null = null

  constructor () {
    super('GameOver')
  }

  create () {
    const { SCREEN_CENTER, SCREEN_WIDTH, SCREEN_HEIGHT } = storeToRefs(useClientStore())
    this.camera = this.cameras.main
    this.camera.setBackgroundColor(0xff0000)

    this.background = this.add.image(SCREEN_CENTER.value.x, SCREEN_CENTER.value.y, 'background')
    this.background.setAlpha(0.5)
    this.background.setDisplaySize(SCREEN_WIDTH.value, SCREEN_HEIGHT.value)

    this.gameOverText = this.add.text(SCREEN_CENTER.value.x, 100, 'Game Over', {
        fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
        stroke: '#000000', strokeThickness: 8,
        align: 'center'
    }).setOrigin(0.5).setDepth(100)

    EventBus.emit('current-scene-ready', this)
  }

  changeScene () {
    this.scene.start('Game')
  }
}
