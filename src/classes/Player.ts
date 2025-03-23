import { GameObjects, Physics } from 'phaser'
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
  public sprite: Physics.Arcade.Sprite
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
  private body: Physics.Arcade.Body

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

    // Create the player sprite
    this.sprite = scene.add.sprite(0, 0, 'player/idle')
      .setScale(scaleSprite)
    
    // Create the beam first so it renders behind the player
    const playerSpriteSrc = { width: 128 * scaleSprite, height: 64 * scaleSprite }
    this.beam = new Beam(this.scene, { x: (playerSpriteSrc.width / 2) * UNIT, y: -35 * UNIT })
    
    // Add both to container
    this.add([this.beam.sprite, this.sprite])

    // Enable physics on the container
    scene.physics.world.enable(this)
    this.body = this.body as Physics.Arcade.Body
    
    // Set up physics properties
    this.body.setCollideWorldBounds(true)
    this.body.setBounce(0)
    this.body.setDrag(this.deceleration.x * 1000 * UNIT, this.deceleration.y * 1000 * UNIT)
    this.body.setMaxVelocity(this.maxVelocity.x * 60 * UNIT, this.maxVelocity.y * 60 * UNIT)

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

  public update (dt: number) {
    this.setDashTargetLocation()
    this.stamina += config.player.staminaRegen

    if (this.isDashing) {
      this.handleDashMovement()
    } else {
      this.handleNormalMovement()
    }

    // Debug visualization
    this.scene.add.circle(this.x, this.y, 10, 0xff00ff)
    
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

  private handleNormalMovement() {
    const acceleration = this.acceleration.x * 1000 * UNIT

    if (this.controls.left) {
      this.body.setAccelerationX(-acceleration)
    } else if (this.controls.right) {
      this.body.setAccelerationX(acceleration)
    } else {
      this.body.setAccelerationX(0)
    }

    if (this.controls.up) {
      this.body.setAccelerationY(-acceleration)
    } else if (this.controls.down) {
      this.body.setAccelerationY(acceleration)
    } else {
      this.body.setAccelerationY(0)
    }
  }

  private handleDashMovement() {
    const dx = this.dashDestinationPos.x - this.x
    const dy = this.dashDestinationPos.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 25) {
      const dashSpeed = config.player.dashSpeed * UNIT * 60
      this.body.setVelocity(
        (dx / distance) * dashSpeed,
        (dy / distance) * dashSpeed
      )
      this.sprite.setTint(config.player.colorDash)
      this.sprite.setPipeline('glow')
    } else {
      this.isDashing = false
      this.sprite.clearTint()
      this.sprite.resetPipeline()
    }
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

  public startBeam () {
    if (!this.store.isPlaying) return
    if (!this.hasEnergyForBeam) return
    this.audio?.playAttack()
    this.beam?.start()
  }

  public stopBeam () {
    if (!this.beam?.isActive) return
    this.audio?.stopAttack()
    this.beam?.end()
  }

  private updateBeam (dt: number) {
    if (!this.hasEnergyForBeam) return
    if (!this.beam?.isActive) return
    this.beam?.update(dt)
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
    this.sprite.destroy()
    super.destroy()
  }
}
