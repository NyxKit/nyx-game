import { Scene, GameObjects, Tweens } from 'phaser'
import type GameControls from './GameControls'
import { clamp } from 'nyx-kit/types'

export default class Player {
  public sprite: GameObjects.Image
  private scene: Scene
  private controls: GameControls
  private speed: number = 2
  private bounds: {
    x: { min: number; max: number }
    y: { min: number; max: number }
  }
  private velocity = {
    x: 2,
    y: 2
  }
  private maxVelocity = {
    x: 2,
    y: 2
  }
  private acceleration = {
    x: 0.1,
    y: 0.1
  }
  private deceleration = {
    x: 0.025,
    y: 0.025
  }

  constructor(scene: Scene, controls: GameControls) {
    this.scene = scene
    this.controls = controls

    // Create the player sprite
    this.sprite = scene.add.image(50, scene.scale.height * 0.5 - 100, 'player')
      .setOrigin(0, 0)
      .setDepth(100)
      .setScrollFactor(0)

    // Calculate bounds with configurable padding
    const padding = {
      horizontal: 20,
      vertical: 20
    }

    this.bounds = {
      x: {
        min: padding.horizontal,
        max: (scene.scale.width - this.sprite.width - padding.horizontal) * 0.5
      },
      y: {
        min: padding.vertical,
        max: scene.scale.height - this.sprite.height - padding.vertical
      }
    }
  }

  private updateVelocity() {
    if (this.controls.left) {
      this.velocity.x = Math.max(this.velocity.x - this.acceleration.x, -this.maxVelocity.x)
    } else if (this.controls.right) {
      this.velocity.x = Math.min(this.velocity.x + this.acceleration.x, this.maxVelocity.x)
    } else {
      if (this.velocity.x > 0) {
        this.velocity.x = Math.max(0, this.velocity.x - this.deceleration.x)
      } else if (this.velocity.x < 0) {
        this.velocity.x = Math.min(0, this.velocity.x + this.deceleration.x)
      }
    }

    if (this.controls.up) {
      this.velocity.y = Math.max(this.velocity.y - this.acceleration.y, -this.maxVelocity.y)
    } else if (this.controls.down) {
      this.velocity.y = Math.min(this.velocity.y + this.acceleration.y, this.maxVelocity.y)
    } else {
      if (this.velocity.y > 0) {
        this.velocity.y = Math.max(0, this.velocity.y - this.deceleration.y)
      } else if (this.velocity.y < 0) {
        this.velocity.y = Math.min(0, this.velocity.y + this.deceleration.y)
      }
    }
  }

  private updatePosition() {
    this.sprite.x += this.velocity.x
    this.sprite.y += this.velocity.y

    this.sprite.x = clamp(this.sprite.x, this.bounds.x.min, this.bounds.x.max)
    this.sprite.y = clamp(this.sprite.y, this.bounds.y.min, this.bounds.y.max)
  }

  update() {
    this.updateVelocity()
    this.updatePosition()
  }

  move(x: number, y: number) {
    this.sprite.setPosition(x, y)
    this.velocity.x = 0
    this.velocity.y = 0
  }

  idle (vueCallback: ({ x, y }: { x: number, y: number }) => void): Tweens.Tween | null {
    return this.scene.tweens.add({
      targets: this.sprite,
      x: { value: 60, duration: 3000, ease: 'Back.easeInOut' },
      y: { value: this.scene.scale.height * 0.5 - 80, duration: 1500, ease: 'Sine.easeInOut' },
      yoyo: true,
      repeat: -1,
      onUpdate: () => {
        if (!vueCallback) return
        vueCallback({
          x: Math.floor(this.sprite.x),
          y: Math.floor(this.sprite.y)
        })
      }
    })
  }
}
