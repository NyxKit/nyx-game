import config from '@/config'
import type { GameScene } from '@/scenes'
import { UNIT } from '@/scenes/GameScene'
import type { OnDestroyEvent } from '@/types'
import { getRandomBetween } from 'nyx-kit/utils'
import { Physics } from 'phaser'
import { v4 as uuidv4 } from 'uuid'

interface BlackHoleOptions {
  onDestroy: OnDestroyEvent
}

export default class BlackHole {
  public id: string
  public sprite: Physics.Arcade.Sprite
  public onDestroy: OnDestroyEvent
  private scene: GameScene
  private pullForce: number = config.blackHole.basePullForce * UNIT
  private maxPullForce: number = config.blackHole.maxPullForce * UNIT
  private size: number

  constructor (scene: GameScene, options: BlackHoleOptions) {
    this.id = uuidv4()
    this.scene = scene
    this.onDestroy = options.onDestroy
    this.size = getRandomBetween(config.blackHole.size[0], config.blackHole.size[1], 0.1)
    this.sprite = this.create()
  }

  private create () {
    // Spawn on right side with random Y position
    const startX = this.scene.scale.width + 100
    const startY = getRandomBetween(0, this.scene.scale.height)

    // Create physics sprite
    const sprite = this.scene.physics.add.sprite(startX, startY, 'blackhole')
      .setScale(this.size * UNIT)
      .setDepth(25)

    // Play the rotation animation
    sprite.anims.play('blackhole')

    // Set initial velocity (moving left)
    sprite.setVelocity(-config.blackHole.speed * UNIT * 60, 0)

    return sprite
  }

  public update (dt: number) {
    // Check if black hole is off screen
    const padding = 500
    if (this.sprite.x < -this.sprite.width - padding) {
      this.destroy()
      return
    }

    // Apply gravitational pull to player
    if (this.scene.player) {
      this.applyGravitationalPull(this.scene.player, dt)
    }
  }

  private applyGravitationalPull (player: any, dt: number) {
    // Calculate vector from player to black hole
    const dx = this.sprite.x - player.x
    const dy = this.sprite.y - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Calculate pull force based on distance (inverse square law)
    // The closer the player is, the stronger the pull
    const pullForce = Math.min(
      this.pullForce / (distance * distance),
      this.maxPullForce
    )

    // Apply force to player (pulling towards black hole)
    const body = player.body as Phaser.Physics.Arcade.Body
    const forceX = (dx / distance) * pullForce * dt * 60
    const forceY = (dy / distance) * pullForce * dt * 60

    // Add the force to the current velocity
    body.setVelocity(
      body.velocity.x + forceX,
      body.velocity.y + forceY
    )

    // Check if player is too close (collision)
    if (distance < this.sprite.displayWidth / 2) {
      player.hp = 0 // Kill player
    }
  }

  public destroy () {
    this.onDestroy(this.id)
    this.sprite.destroy()
  }
}
