import type { GameScene } from '@/scenes'
import { type OnDestroyEvent } from '@/types'
import { createSpriteAnimation } from '@/utils'
import type { GameObjects, Scene } from 'phaser'
import { v4 as uuidv4 } from 'uuid'
import { clamp } from 'nyx-kit/utils'

export default class Beam {
  private scene: Scene
  private key: string = 'beam'
  public origin: { x: number; y: number } = { x: 0, y: 0 }
  public id: string = uuidv4()
  public sprite: GameObjects.Sprite
  private baseRotation: number = Math.PI / 2
  public isActive: boolean = false

  constructor (scene: Scene, origin: { x: number, y: number }) {
    this.scene = scene
    this.origin = origin
    this.sprite = this.scene.add.sprite(this.origin.x - 50, 0, this.key)
      .setRotation(this.baseRotation).setAlpha(0).setOrigin(0.5, 1)
    createSpriteAnimation(this.scene.anims, 'beam-start', 'beam', [0, 1, 2, 3, 4, 5, 6, 7], 0)
    createSpriteAnimation(this.scene.anims, 'beam-active', 'beam', [8, 9, 10, 11, 12, 13, 14, 15]) 
    createSpriteAnimation(this.scene.anims, 'beam-end', 'beam', [16, 17, 18, 19, 20, 21, 22, 23], 0)
  }

  start (pos: { x: number, y: number }) {
    this.isActive = true
    this.sprite
      .setAlpha(1)
      .setScale(3, 20)
    if (!this.sprite.anims) return
    this.sprite.anims.play('beam-start')
      .once('animationcomplete', () => this.sprite.anims.play('beam-active'))
    this.update(pos)
  }

  update (pos: { x: number, y: number }) {
    if (!this.isActive) return
    // if (!this.sprite || !this.origin) return
    const pointer = this.scene.input.activePointer
    const angle = Phaser.Math.Angle.Between(pos.x, pos.y, pointer.worldX, pointer.worldY) + this.baseRotation
    const minAngle = this.baseRotation - Math.PI / 3 // -60 degrees in radians
    const maxAngle = this.baseRotation + Math.PI / 3  // 60 degrees in radians
    const clampedAngle = clamp(angle, minAngle, maxAngle)
    this.sprite.setRotation(clampedAngle)
  }

  end () {
    this.isActive = false
    this.sprite.anims.play('beam-end')
  }

  destroy () {
    this.sprite.destroy()
  }
}
