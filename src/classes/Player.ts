import { Scene, GameObjects, Tweens } from 'phaser'
import type GameControls from './GameControls'
import { clamp } from 'nyx-kit/utils'
import useGameStore from '@/stores/game'
import Beam from './Beam'
import type { GameScene } from '@/scenes'

export default class Player extends Phaser.GameObjects.Container {
  public sprite: GameObjects.Image
  public scene: GameScene
  private controls: GameControls
  private store = useGameStore()
  private speed: number = 2
  private teleportDistance: number = 250
  private velocity = {
    x: 2,
    y: 2
  }
  private maxVelocity = {
    x: 4,
    y: 4
  }
  private acceleration = {
    x: 0.2,
    y: 0.2
  }
  private deceleration = {
    x: 0.1,
    y: 0.1
  }
  public beam: Beam | null = null
  private energyDrainRate = 0.1 // Energy drain per frame while shooting
  private lastTeleportTime = 0
  private readonly teleportCooldown = 1000

  constructor (scene: GameScene, controls: GameControls) {
    super(scene, 0, 0)
    this.scene = scene
    this.controls = controls

    const playerSpriteSrc = this.scene.textures.get('player').getSourceImage()

    // Create the beam first so it renders behind the player
    this.beam = new Beam(this.scene, { x: playerSpriteSrc.width / 2, y: 0 })
    this.add(this.beam.sprite)

    // Create the player sprite after so it renders on top
    this.sprite = scene.add.image(0, 0, 'player')
    this.add(this.sprite)

    // Add container to scene
    scene.add.existing(this)

    // Add mouse input handling
    scene.input.on('pointerdown', this.createBeam, this)
    scene.input.on('pointerup', this.destroyBeam, this)
    scene.input.on('pointermove', this.updateBeam, this)
  }

  private get hasEnergy () {
    return this.store.energy > this.energyDrainRate || this.store.debug.hasInfiniteEnergy
  }

  public get currentPosition () {
    return {
      x: this.x,
      y: this.y
    }
  }

  private updateVelocity () {
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

  private teleport () {
    let newX = this.x
    let newY = this.y
    
    // Set full momentum in teleport direction
    if (this.controls.left) {
      newX -= this.teleportDistance
      this.velocity.x = -this.maxVelocity.x
    } else if (this.controls.right) {
      newX += this.teleportDistance
      this.velocity.x = this.maxVelocity.x
    }

    if (this.controls.up) {
      newY -= this.teleportDistance
      this.velocity.y = -this.maxVelocity.y
    } else if (this.controls.down) {
      newY += this.teleportDistance
      this.velocity.y = this.maxVelocity.y
    }
    
    // Move to new position
    this.setPosition(
      clamp(newX, 0, this.scene.scale.width - this.sprite.width),
      clamp(newY, 0, this.scene.scale.height - this.sprite.height)
    )
  }

  private updatePosition () {
    this.x += this.velocity.x
    this.y += this.velocity.y

    this.x = clamp(this.x, 0, this.scene.scale.width - this.sprite.width)
    this.y = clamp(this.y, 0, this.scene.scale.height - this.sprite.height)
  }

  update (_velocity: number, time: number, delta: number) {
    if (this.controls.space) {
      const currentTime = this.scene.time.now
      if (currentTime - this.lastTeleportTime >= this.teleportCooldown) {
        this.teleport()
        this.lastTeleportTime = currentTime
      }
      this.controls.space = false
    }

    this.updateVelocity()
    this.updatePosition()
    this.store.setPlayerPosition(this.x, this.y)

    if (this.hasEnergy && this.beam?.isActive) {
      this.beam.handleScaling()
      this.store.energy -= this.energyDrainRate
    } else if (this.beam?.isActive) {
      this.beam.end()
    }
  }

  move (x: number, y: number) {
    this.setPosition(x, y)
  }

  destroy(): void {
    if (this.beam) {
      this.scene.input.off('pointerdown', this.createBeam, this)
      this.scene.input.off('pointerup', this.destroyBeam, this)
      this.scene.input.off('pointermove', this.updateBeam, this)
      this.beam.destroy()
    }

    super.destroy()
  }

  private createBeam () {
    if (!this.hasEnergy) return
    this.beam?.start(this.currentPosition)
  }

  private destroyBeam () {
    if (!this.hasEnergy) return
    this.beam?.end()
  }

  private updateBeam () {
    if (!this.hasEnergy) return
    this.beam?.update(this.currentPosition)
  }
}
