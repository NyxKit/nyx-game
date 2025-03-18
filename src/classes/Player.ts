import { GameObjects } from 'phaser'
import type GameControls from './GameControls'
import { clamp } from 'nyx-kit/utils'
import useGameStore from '@/stores/game'
import Beam from './Beam'
import type { GameScene } from '@/scenes'
import config from '@/config'
import type { Audio } from './Audio'
import { UNIT } from '@/scenes/GameScene'
import { createSpriteAnimation } from '@/utils'

export default class Player extends Phaser.GameObjects.Container {
  public sprite: GameObjects.Sprite
  public scene: GameScene
  private controls: GameControls
  private store = useGameStore()
  private velocity = {
    x: config.player.velocity * UNIT,
    y: config.player.velocity * UNIT
  }
  private maxVelocity = {
    x: config.player.maxVelocity * UNIT,
    y: config.player.maxVelocity * UNIT
  }
  private acceleration = {
    x: config.player.acceleration * UNIT,
    y: config.player.acceleration * UNIT
  }
  private deceleration = {
    x: config.player.deceleration * UNIT,
    y: config.player.deceleration * UNIT
  }
  public beam: Beam | null = null
  private energyDrainRate = config.player.energyDrainRate // Energy drain per frame while shooting

  private _isDashing: boolean = false
  private dashDistance: number = config.player.dashDistance * UNIT
  private dashCooldown: number = config.player.dashCooldown
  private lastDashTime: number = 0
  private dashDestinationPos: { x: number, y: number } = { x: 0, y: 0 }
  private audio: Audio|null = null

  constructor (scene: GameScene, controls: GameControls) {
    super(scene, 0, 0)
    this.scene = scene
    this.controls = controls
    this.audio = scene.audio

    const scaleSprite = 3 * UNIT

    // Create the beam first so it renders behind the player
    // const playerSpriteSrc = this.scene.textures.get('player').getSourceImage()
    const playerSpriteSrc = { width: 128 * scaleSprite, height: 64 * scaleSprite }
    this.beam = new Beam(this.scene, { x: (playerSpriteSrc.width / 2), y: -35 })
    this.add(this.beam.sprite)

    // Create the player sprite after so it renders on top
    // this.sprite = scene.add.image(0, 0, 'playerImage').setScale(UNIT)
    this.sprite = this.scene.add.sprite(0, 0, 'player/idle').setScale(scaleSprite)
    this.add(this.sprite)

    this.scene.anims.create({
      key: 'player-idle',
      frames: this.scene.anims.generateFrameNames('player/idle', { start: 0, end: 28 }),
      frameRate: 8,
      repeat: -1
    })

    this.sprite.anims.play('player-idle')

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

  public get stamina () {
    return this.store.stamina
  }

  public set stamina (value: number) {
    if (this.store.debug.hasInfiniteStamina) return
    const stamina = clamp(value, 0, this.store.maxStamina)
    this.store.setPlayerStamina(stamina)
  }

  public get isDashing () {
    return this._isDashing
  }

  public set isDashing (value: boolean) {
    this._isDashing = value
    if (value) {
      this.audio?.stopSfx('noEnergy')
      this.audio?.playSfx('playerDash')
      this.stamina -= config.player.dashStaminaCost
    } else {
      // this.audio?.sfx.playerDash?.stop()
    }
  }

  private get hasEnergyForBeam () {
    return this.energy >= this.energyDrainRate || this.store.debug.hasInfiniteEnergy
  }

  private get hasStaminaForDash () {
    return this.stamina >= config.player.dashStaminaCost || this.store.debug.hasInfiniteStamina
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

  update (dt: number) {
    this.setDashTargetLocation()
    this.stamina += config.player.staminaRegen
    const { vx, vy } = this.isDashing ? this.getVelocityDash() : this.getVelocity()

    const newPos = this.getPosition(vx, vy, dt)
    this.x = newPos.x
    this.y = newPos.y
    this.velocity.x = vx
    this.velocity.y = vy
    this.store.setPlayerPosition(this.x, this.y)

    if (this.hasEnergyForBeam && this.beam?.isActive) {
      this.beam.handleScaling()
      this.updateBeam(dt)
      this.energy -= this.energyDrainRate
    } else if (this.beam?.isActive) {
      this.audio?.playSfx('noEnergy')
      this.stopBeam()
    } else {
      this.energy += config.player.energyRegen
    }
  }

  private getPosition (vx: number, vy: number, dt: number): { x: number, y: number } {
    const newX = this.x + vx * (dt * 60)
    const newY = this.y + vy * (dt * 60)
    const pos = this.getClampedPosition(newX, newY)
    return pos
  }

  private getVelocity (): { vx: number, vy: number } {
    let vx = this.velocity.x
    let vy = this.velocity.y

    if (this.controls.left) {
      vx = clamp(vx - this.acceleration.x, -this.maxVelocity.x, this.maxVelocity.x)
    } else if (this.controls.right) {
      vx = clamp(vx + this.acceleration.x, -this.maxVelocity.x, this.maxVelocity.x)
    } else {
      if (vx > 0) {
        vx = clamp(Math.max(0, vx - this.deceleration.x), -this.maxVelocity.x, this.maxVelocity.x)
      } else if (vx < 0) {
        vx = clamp(Math.min(0, vx + this.deceleration.x), -this.maxVelocity.x, this.maxVelocity.x)
      }
    }

    if (this.controls.up) {
      vy = clamp(vy - this.acceleration.y, -this.maxVelocity.y, this.maxVelocity.y)
    } else if (this.controls.down) {
      vy = clamp(vy + this.acceleration.y, -this.maxVelocity.y, this.maxVelocity.y)
    } else {
      if (vy > 0) {
        vy = clamp(Math.max(0, vy - this.deceleration.y), -this.maxVelocity.y, this.maxVelocity.y)
      } else if (vy < 0) {
        vy = clamp(Math.min(0, vy + this.deceleration.y), -this.maxVelocity.y, this.maxVelocity.y)
      }
    }

    return { vx, vy }
  }

  private setDashTargetLocation () {
    if (!this.controls.space) return
    if (!this.controls.left && !this.controls.right && !this.controls.up && !this.controls.down) {
      this.controls.space = false
      return
    }
    const currentTime = this.scene.time.now
    const isDashOnCooldown = currentTime - this.lastDashTime < this.dashCooldown
    if (isDashOnCooldown) {
      this.controls.space = false
      return
    }
    if (!this.hasStaminaForDash) {
      this.audio?.playSfx('noEnergy', { cooldown: 2000 })
      this.controls.space = false
      return
    }
    this.isDashing = true
    this.lastDashTime = currentTime
    const targetPos = {
      x: this.x + (this.controls.left ? -this.dashDistance : this.controls.right ? this.dashDistance : 0),
      y: this.y + (this.controls.up ? -this.dashDistance : this.controls.down ? this.dashDistance : 0)
    }
    this.dashDestinationPos = this.getClampedPosition(targetPos.x, targetPos.y)
    this.controls.space = false
  }

  private getVelocityDash (): { vx: number, vy: number } {
    // Calculate direction to destination
    const dx = this.dashDestinationPos.x - this.x
    const dy = this.dashDestinationPos.y - this.y
    let vx = this.velocity.x
    let vy = this.velocity.y

    // Calculate distance to destination
    const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 0)

    if (distance > 25) {
      // Normalize direction and apply dash speed
      const dashSpeed = config.player.dashSpeed * UNIT
      vx = (dx / distance) * dashSpeed
      vy = (dy / distance) * dashSpeed

      // Add blue/white shine effect while dashing
      this.sprite.setTint(config.player.colorDash)
      this.sprite.setPipeline('glow')
    } else {
      // Reached destination, stop dashing
      vx = this.controls.right ? this.maxVelocity.x : this.controls.left ? -this.maxVelocity.x : 0
      vy = this.controls.down ? this.maxVelocity.y : this.controls.up ? -this.maxVelocity.y : 0
      this.isDashing = false

      // Remove shine effect
      this.sprite.clearTint()
      this.sprite.resetPipeline()
    }

    return { vx, vy }
  }

  public startBeam () {
    if (!this.store.isPlaying) return
    if (!this.hasEnergyForBeam) return
    this.audio?.playAttack()
    this.beam?.start(this.currentPosition)
  }

  public stopBeam () {
    if (!this.beam?.isActive) return
    this.audio?.stopAttack()
    this.beam?.end()
  }

  private updateBeam (dt: number) {
    if (!this.hasEnergyForBeam) return
    if (!this.beam?.isActive) return
    this.beam?.update(dt, this.currentPosition)
  }

  private playDamageAnimation () {
    this.sprite.setTint(config.player.colorDamage)
    this.sprite.setPipeline('glow')
    window.setTimeout(() => {
      this.sprite.clearTint()
      this.sprite.resetPipeline()
    }, 200)
  }

  private getClampedPosition (x: number, y: number) {
    return {
      x: clamp(x, this.sprite.displayWidth / 2, this.scene.scale.width - this.sprite.displayWidth / 2),
      y: clamp(y, this.sprite.displayHeight / 2, this.scene.scale.height - this.sprite.displayHeight / 2)
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
}
