import { GameObjects } from 'phaser'
import type GameControls from './GameControls'
import { clamp } from 'nyx-kit/utils'
import useGameStore from '@/stores/game'
import Beam from './Beam'
import type { GameScene } from '@/scenes'
import config from '@/config'
import type { Audio } from './Audio'

export default class Player extends Phaser.GameObjects.Container {
  public sprite: GameObjects.Image
  public scene: GameScene
  private controls: GameControls
  private store = useGameStore()
  private velocity = {
    x: config.player.velocity,
    y: config.player.velocity
  }
  private maxVelocity = {
    x: config.player.maxVelocity,
    y: config.player.maxVelocity
  }
  private acceleration = {
    x: config.player.acceleration,
    y: config.player.acceleration
  }
  private deceleration = {
    x: config.player.deceleration,
    y: config.player.deceleration
  }
  public beam: Beam | null = null
  private energyDrainRate = config.player.energyDrainRate // Energy drain per frame while shooting

  private _isDashing: boolean = false
  private dashDistance: number = config.player.dashDistance
  private dashCooldown: number = config.player.dashCooldown
  private lastDashTime: number = 0
  private dashDestinationPos: { x: number, y: number } = { x: 0, y: 0 }
  private audio: Audio|null = null

  constructor (scene: GameScene, controls: GameControls) {
    super(scene, 0, 0)
    this.scene = scene
    this.controls = controls
    this.audio = scene.audio

    // Create the beam first so it renders behind the player
    const playerSpriteSrc = this.scene.textures.get('player').getSourceImage()
    this.beam = new Beam(this.scene, { x: playerSpriteSrc.width / 2, y: 0 })
    this.add(this.beam.sprite)

    // Create the player sprite after so it renders on top
    this.sprite = scene.add.image(0, 0, 'player')
    this.add(this.sprite)

    // Add container to scene
    scene.add.existing(this)

    // Add mouse input handling
    scene.input.on('pointerdown', this.startBeam, this)
    scene.input.on('pointerup', this.stopBeam, this)
  }

  public get hp () {
    return this.store.hp
  }

  public set hp (value: number) {
    if (this.store.debug.isImmortal) return
    const isDamage = value < this.hp
    const hp = clamp(value, 0, config.player.hpMax)
    this.store.setPlayerHp(hp)
    if (!isDamage) return
    this.stopBeam()
    if (hp <= 0) {
      this.audio?.sfx.playerDeath?.play()
    } else {
      this.audio?.sfx.playerDamage?.play()
    }
    this.playDamageAnimation()
  }

  public get energy () {
    return this.store.energy
  }

  public set energy (value: number) {
    if (this.store.debug.hasInfiniteEnergy) return
    const energy = clamp(value, 0, config.player.energyMax)
    this.store.setPlayerEnergy(energy)
  }

  public get isDashing () {
    return this._isDashing
  }

  public set isDashing (value: boolean) {
    this._isDashing = value
    if (value) {
      this.audio?.stopSfx('noEnergy')
      this.audio?.playSfx('playerDash')
      this.energy -= config.player.dashEnergyCost
      // this.stopBeam()
    } else {
      // this.audio?.sfx.playerDash?.stop()
    }
  }

  private get hasEnergyForBeam () {
    return this.energy >= this.energyDrainRate || this.store.debug.hasInfiniteEnergy
  }

  private get hasEnergyForDash () {
    return this.energy >= config.player.dashEnergyCost || this.store.debug.hasInfiniteEnergy
  }

  public get currentPosition () {
    return {
      x: this.x,
      y: this.y
    }
  }

  public get damage () {
    const score = this.store.score
    if (score < 1000) return 1
    return 1 + ((score - 1000) / 500)
  }

  public get bounds () {
    const padding = config.player.boundsPadding
    const playerBounds = this.sprite.getBounds()
    return new Phaser.Geom.Rectangle(
      playerBounds.x + padding,
      playerBounds.y + padding,
      playerBounds.width - (padding * 2),
      playerBounds.height - (padding * 2)
    )
  }

  update (velocity: number, time: number, delta: number) {
    this.setDashTargetLocation()

    if (this.isDashing) {
      this.handleDash()
    } else {
      this.updateVelocity()
      this.updatePosition()
    }

    this.store.setPlayerPosition(this.x, this.y)

    if (this.hasEnergyForBeam && this.beam?.isActive) {
      this.beam.handleScaling()
      this.updateBeam()
      this.energy -= this.energyDrainRate
    } else if (this.beam?.isActive) {
      this.audio?.playSfx('noEnergy')
      this.stopBeam()
    } else {
      this.energy += config.player.energyRegen
    }
  }

  destroy(): void {
    if (this.beam) {
      this.scene.input.off('pointerdown', this.startBeam, this)
      this.scene.input.off('pointerup', this.stopBeam, this)
      this.beam.destroy()
    }

    super.destroy()
  }

  private getClampedPosition (x: number, y: number) {
    return {
      x: clamp(x, 0, this.scene.scale.width - this.sprite.width),
      y: clamp(y, 0, this.scene.scale.height - this.sprite.height)
    }
  }

  private updatePosition () {
    this.x += this.velocity.x
    this.y += this.velocity.y
    const clampedPosition = this.getClampedPosition(this.x, this.y)
    this.x = clampedPosition.x
    this.y = clampedPosition.y
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

  private setDashTargetLocation () {
    if (!this.controls.space) return
    if (!this.controls.left && !this.controls.right && !this.controls.up && !this.controls.down) return
    const currentTime = this.scene.time.now
    const isDashOnCooldown = currentTime - this.lastDashTime < this.dashCooldown
    if (isDashOnCooldown) return
    if (!this.hasEnergyForDash) {
      this.audio?.playSfx('noEnergy', { cooldown: 2000 })
      return
    }
    this.isDashing = true
    this.lastDashTime = currentTime
    this.dashDestinationPos = {
      x: this.x + (this.controls.left ? -this.dashDistance : this.controls.right ? this.dashDistance : 0),
      y: this.y + (this.controls.up ? -this.dashDistance : this.controls.down ? this.dashDistance : 0)
    }
    this.dashDestinationPos = this.getClampedPosition(this.dashDestinationPos.x, this.dashDestinationPos.y)
    this.controls.space = false
  }

  private handleDash () {
    // Calculate direction to destination
    const dx = this.dashDestinationPos.x - this.x
    const dy = this.dashDestinationPos.y - this.y

    // Calculate distance to destination
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 20) {
      // Normalize direction and apply dash speed
      const dashSpeed = config.player.dashSpeed // Using config value
      this.velocity.x = (dx / distance) * dashSpeed
      this.velocity.y = (dy / distance) * dashSpeed

      // Add blue/white shine effect while dashing
      this.sprite.setTint(config.player.colorDash)
      this.sprite.setPipeline('glow')
    } else {
      // Reached destination, stop dashing
      this.velocity.x = this.controls.right ? this.maxVelocity.x : this.controls.left ? -this.maxVelocity.x : 0
      this.velocity.y = this.controls.down ? this.maxVelocity.y : this.controls.up ? -this.maxVelocity.y : 0
      this.isDashing = false

      // Remove shine effect
      this.sprite.clearTint()
      this.sprite.resetPipeline()
    }

    this.updatePosition()
  }

  public startBeam () {
    if (!this.store.isPlaying) return
    if (!this.hasEnergyForBeam) return
    this.audio?.playAttack()
    this.beam?.start(this.currentPosition)
  }

  public stopBeam () {
    if (!this.beam?.isActive) return
    if (!this.store.isPlaying) return
    this.audio?.stopAttack()
    this.beam?.end()
  }

  private updateBeam () {
    if (!this.hasEnergyForBeam) return
    if (!this.beam?.isActive) return
    this.beam?.update(this.currentPosition)
  }

  private playDamageAnimation () {
    this.sprite.setTint(config.player.colorDamage)
    this.sprite.setPipeline('glow')
    window.setTimeout(() => {
      this.sprite.clearTint()
      this.sprite.resetPipeline()
    }, 200)
  }
}
