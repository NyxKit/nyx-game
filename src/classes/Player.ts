import { Scene, GameObjects, Tweens } from 'phaser'
import type GameControls from './GameControls'
import { clamp } from 'nyx-kit/utils'
import useGameStore from '@/stores/game'

export default class Player extends Phaser.GameObjects.Container {
  public sprite: GameObjects.Image
  public scene: Scene
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
  public beam: Phaser.GameObjects.Rectangle | null = null;
  private beamSize = 24
  private beamColor = 0x9F50F0 // Purple color for the beam
  private beamRange = 2000 // How far the beam extends
  private energyDrainRate = 0.1 // Energy drain per frame while shooting
  private lastTeleportTime = 0
  private readonly teleportCooldown = 1000

  constructor (scene: Scene, controls: GameControls) {
    super(scene, 0, 0)
    this.scene = scene
    this.controls = controls

    // Create the player sprite
    this.sprite = scene.add.image(0, 0, 'player')
    this.add(this.sprite)

    // Add container to scene
    scene.add.existing(this)

    // Add mouse input handling
    scene.input.on('pointerdown', this.startBeam, this)
    scene.input.on('pointerup', this.stopBeam, this)
    scene.input.on('pointermove', this.updateBeamAngle, this)
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

  public get beamOrigin () {
    return {
      x: this.x + this.sprite.width / 2,
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

  update (_velocity: number) {
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

    // Handle beam energy drain
    if (!this.beam) return
    if (this.store.energy > 0 && !this.store.debug.hasInfiniteEnergy) {
      this.store.energy -= this.energyDrainRate
      if (this.store.energy <= 0) {
        this.stopBeam()
      }
    }
  }

  move (x: number, y: number) {
    this.setPosition(x, y)
  }

  private startBeam(): void {
    if (this.beam || !this.hasEnergy) return
    this.beam = this.scene.add.rectangle(this.sprite.width / 2, 0, this.beamRange, this.beamSize, this.beamColor)
      .setOrigin(0, 0.5)
      .setDepth(1000)
    this.add(this.beam)
    this.updateBeamAngle()
  }

  private stopBeam(): void {
    if (!this.beam) return
    this.beam.destroy()
    this.beam = null
  }

  private updateBeamAngle(): void {
    if (!this.beam) return
    const pointer = this.scene.input.activePointer
    const angle = Phaser.Math.Angle.Between(this.beamOrigin.x, this.beamOrigin.y, pointer.worldX, pointer.worldY)
    const minAngle = -Math.PI / 3 // -60 degrees in radians
    const maxAngle = Math.PI / 3  // 60 degrees in radians
    const clampedAngle = clamp(angle, minAngle, maxAngle)
    this.beam.setRotation(clampedAngle)
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.startBeam, this)
    this.scene.input.off('pointerup', this.stopBeam, this)
    this.scene.input.off('pointermove', this.updateBeamAngle, this)
    super.destroy()
  }
}
