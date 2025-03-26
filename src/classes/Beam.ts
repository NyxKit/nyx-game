import type { GameScene } from '@/scenes'
import { createSpriteAnimation } from '@/utils'
import { Physics } from 'phaser'
import { v4 as uuidv4 } from 'uuid'
import { clamp } from 'nyx-kit/utils'
import config from '@/config'
import { UNIT } from '@/scenes/GameScene'

export default class Beam {
  public origin: { x: number; y: number } = { x: 0, y: 0 }
  public id: string = uuidv4()
  public sprite: Physics.Arcade.Sprite
  public isActive: boolean = false
  private scene: GameScene
  private key: string = 'beam'
  private beamStartTime: number = 0
  private scaleX: number = config.beam.scaleX
  private currentAngle: number = 0
  private readonly weight: number = 0.2 // 0.1 = heavy, 0.5 = lighter, 1.0 = equal to target

  constructor (scene: GameScene, origin: { x: number, y: number }) {
    this.scene = scene
    this.origin = origin

    // Create physics sprite
    this.sprite = this.scene.physics.add.sprite(this.origin.x, this.origin.y, this.key)
      .setAlpha(0)
      .setOrigin(0, 0.5)

    // Set up physics properties
    this.sprite.setImmovable(true)
    if (this.sprite.body instanceof Phaser.Physics.Arcade.Body) {
      this.sprite.body.setGravity(0, 0)
      // this.sprite.body.setSize(this.sprite.width * 0.8, this.sprite.height * 0.4) // Adjust hitbox
    }

    // Create animations
    createSpriteAnimation(this.scene.anims, 'beam-start', this.key, [0, 1, 2, 3, 4, 5, 6, 7], 0)
    createSpriteAnimation(this.scene.anims, 'beam-active', this.key, [8, 9, 10, 11, 12, 13, 14, 15])
    createSpriteAnimation(this.scene.anims, 'beam-end', this.key, [16, 17, 18, 19, 20, 21, 22, 23], 0)
  }

  get bounds () {
    return this.sprite.getBounds()
  }

  get scaleY () {
    return clamp(this.scene.player?.damage ?? 1, 1, 4)
  }

  public start () {
    this.isActive = true
    this.sprite
      .setAlpha(1)
      .setScale(this.scaleX * UNIT, this.scaleY * UNIT)
      // .setActive(true)
      // .setVisible(true)

    if (!this.sprite.anims) return
    this.sprite.anims.play('beam-start').once('animationcomplete', () => {
      if (!this.isActive) return
      this.sprite.anims.play('beam-active')
    })

    this.update(0)
    this.beamStartTime = this.scene.time.now
  }

  public update (dt: number) {
    if (!this.isActive || !this.scene.player) return

    const x = this.scene.player.x + this.origin.x
    const y = this.scene.player.y + this.origin.y

    const pointer = this.scene.input.activePointer
    const targetAngle = Phaser.Math.Angle.Between(x, y, pointer.worldX, pointer.worldY)
    const clampedTargetAngle = clamp(targetAngle, config.beam.minAngle, config.beam.maxAngle)

    // Smoothly interpolate between current angle and target angle
    this.currentAngle += (clampedTargetAngle - this.currentAngle) * this.weight * (dt * 60)

    // Update physics body rotation and position
    this.sprite.setRotation(this.currentAngle)

    // Update physics body size based on current scale
    // const currentScale = this.sprite.scaleX
    // if (this.sprite.body) {
    //   this.sprite.body.setSize(
    //     this.sprite.width * 0.8 * currentScale,
    //     this.sprite.height * 0.4 * currentScale
    //   )
    // }
  }

  public end () {
    this.isActive = false
    this.sprite.anims.stop()
    this.sprite.anims.play('beam-end').once('animationcomplete', () => {
      this.sprite.setScale(this.scaleX * UNIT, this.scaleY * UNIT)
      // this.sprite.setActive(false)
      // this.sprite.setVisible(false)
    })
    this.beamStartTime = 0
  }

  public destroy () {
    this.sprite.destroy()
  }

  public handleScaling () {
    if (!this.isActive) return
    const maxScale = config.beam.maxScale
    const scaleDuration = config.beam.scaleDuration
    const scaleProgress = Math.min(1, (this.scene.time.now - this.beamStartTime) / scaleDuration)
    const beamScale = this.scaleX + (maxScale - this.scaleX) * scaleProgress
    this.sprite.setScale(beamScale * UNIT, this.scaleY * UNIT)
  }
}
