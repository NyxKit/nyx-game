import type { GameScene } from '@/scenes'
import { type OnDestroyEvent } from '@/types'
import { createSpriteAnimation } from '@/utils'
import type { GameObjects, Scene } from 'phaser'
import { v4 as uuidv4 } from 'uuid'
import { clamp } from 'nyx-kit/utils'
import config from '@/config'

export default class Beam {
  private scene: GameScene
  private key: string = 'beam'
  public origin: { x: number; y: number } = { x: 0, y: 0 }
  private originOffset: { x: number, y: number } = { x: -50, y: 0 }
  public position: { x: number, y: number } = { x: 0, y: 0 }
  public id: string = uuidv4()
  public sprite: GameObjects.Sprite
  public isActive: boolean = false
  private beamStartTime: number = 0
  private scaleX: number = config.beam.scaleX
  private currentAngle: number = 0
  private readonly weight: number = 0.2 // 0.1 = heavy, 0.5 = lighter, 1.0 = equal to target

  constructor (scene: GameScene, origin: { x: number, y: number }) {
    this.scene = scene
    this.origin = origin
    this.position = { x: origin.x + this.originOffset.x, y: origin.y + this.originOffset.y }
    this.sprite = this.scene.add.sprite(this.position.x, this.position.y, this.key)
      .setAlpha(0).setOrigin(0, 0.5)
    createSpriteAnimation(this.scene.anims, 'beam-start', 'beam', [0, 1, 2, 3, 4, 5, 6, 7], 0)
    createSpriteAnimation(this.scene.anims, 'beam-active', 'beam', [8, 9, 10, 11, 12, 13, 14, 15])
    createSpriteAnimation(this.scene.anims, 'beam-end', 'beam', [16, 17, 18, 19, 20, 21, 22, 23], 0)
  }

  get bounds () {
    const points = this.sprite.getBounds().getPoints(4)
    const minX = Math.min(...points.map((p) => p.x))
    const maxX = Math.max(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxY = Math.max(...points.map((p) => p.y))
    return new Phaser.Geom.Rectangle(minX, minY, maxX - minX, maxY - minY)
  }

  get scaleY () {
    return clamp(this.scene.player?.damage ?? 1, 1, 4)
  }

  start (pos: { x: number, y: number }) {
    this.isActive = true
    this.sprite
      .setAlpha(1)
      .setOrigin(0, 0.5)
      .setScale(this.scaleX, this.scaleY)
    if (!this.sprite.anims) return
    this.sprite.anims.play('beam-start')
      .once('animationcomplete', () => this.isActive && this.sprite.anims.play('beam-active'))
    this.update(pos)
    this.beamStartTime = this.scene.time.now
  }

  update (pos: { x: number, y: number }) {
    if (!this.isActive) return
    const pointer = this.scene.input.activePointer
    const { x, y } = { x: pos.x + this.position.x, y: pos.y + this.position.y }
    const targetAngle = Phaser.Math.Angle.Between(x, y, pointer.worldX, pointer.worldY)
    const minAngle = config.beam.minAngle
    const maxAngle = config.beam.maxAngle
    const clampedTargetAngle = clamp(targetAngle, minAngle, maxAngle)

    // Smoothly interpolate between current angle and target angle
    this.currentAngle += (clampedTargetAngle - this.currentAngle) * this.weight
    this.sprite.setRotation(this.currentAngle)
  }

  end () {
    this.isActive = false
    this.sprite.anims.stop()
    this.sprite.anims.play('beam-end')
      .once('animationcomplete', () => this.sprite.setScale(this.scaleX, this.scaleY))
    this.beamStartTime = 0
  }

  destroy () {
    this.sprite.destroy()
  }

  public handleScaling () {
    if (!this.isActive) return
    const maxScale = config.beam.maxScale
    const scaleDuration = config.beam.scaleDuration
    const scaleProgress = Math.min(1, (this.scene.time.now - this.beamStartTime) / scaleDuration)
    const beamScale = this.scaleX + (maxScale - this.scaleX) * scaleProgress
    this.sprite.setScale(beamScale, this.scaleY)
  }
}
