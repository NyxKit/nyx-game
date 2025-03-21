import { Scene } from 'phaser'
import { EventBus, GameControls, Player, Background, Asteroid } from '@/classes'
import useGameStore from '@/stores/game'
import { clamp } from 'nyx-kit/utils'
import { PowerUpType } from '@/types'
import type { KeyDict } from 'nyx-kit/types'
import PowerUp from '@/classes/PowerUp'
import { createSpriteAnimation } from '@/utils'
import { Audio } from '@/classes/Audio'
import config from '@/config'
import { GameEvents } from '@/classes/EventBus'

export let UNIT = 1

export default class GameScene extends Scene {
  private controls: GameControls | null = null
  private background: Background | null = null
  public player: Player | null = null
  public velocity = 1
  private asteroidSpeed = 0
  private store = useGameStore()
  private asteroids: Asteroid[] = []
  private lastSpawnTime = 0
  private powerUps: PowerUp[] = []
  public audio: Audio | null = null
  public unit: number = 1

  constructor () {
    super('Game')

    EventBus.addListener(GameEvents.TogglePaused, this.togglePaused.bind(this))
  }

  reset () {
    this.asteroids.forEach((asteroid) => asteroid.destroy())
    this.asteroids = []
    this.powerUps.forEach((powerUp) => powerUp.destroy())
    this.powerUps = []
    this.player?.setPosition(200, this.scale.height / 2)
    this.player?.stopBeam()
    // this.audio?.soundtrack?.stop()
    // this.audio = null
    this.lastSpawnTime = 0
    // this.scene.restart()
    this.togglePaused(false)
  }

  public togglePaused (isPaused: boolean) {
    if (isPaused) {
      this.scene.pause()
    } else {
      this.scene.resume()
    }
  }

  create () {
    if (!this.input.keyboard) {
      throw new Error('No keyboard input found')
    }

    this.audio = new Audio(this)
    this.audio.playSoundtrack()
    UNIT = this.scale.width / 1920

    this.controls = new GameControls(this.input.keyboard)
    this.background = new Background(this, this.controls)
    this.player = new Player(this, this.controls)
    this.player.setDepth(1000)
    this.player.setPosition(200, this.scale.height / 2)

    // createSpriteAnimation(this.anims, 'explosion-sm', 'explosion/sm', [0, 1, 2, 3], 0)
    createSpriteAnimation(this.anims, 'explosion/md', 'explosion/md', [0, 1, 2, 3], 0)
    // createSpriteAnimation(this.anims, 'explosion-lg', 'explosion/lg', [0, 1, 2, 3], 0)

    EventBus.emit(GameEvents.CurrentSceneReady, this)
  }

  update (time: number, delta: number) {
    if (!this.player || !this.background) return
    if (this.store.isPaused) return

    const dt = delta / 1000

    // this.velocity = 1 + Math.log10(Math.max(1, this.store.score / 1000)) * 2 + Math.pow(this.store.score / 1000, 1.1)
    const v = 1 + Math.log1p(Math.max(1, this.store.score / 500)) * 2 + Math.pow(this.store.score / 1000, 1.025)
    this.velocity = clamp(v * dt * 60, 1, 30)

    if (!this.store.isInGame) {
      this.background.update(dt, this.velocity)
      return
    }

    if (!this.store.isPlaying) return

    this.store.score += dt
    const playerPos = this.player.currentPosition

    this.asteroids.forEach((asteroid) => asteroid.update(dt))
    this.powerUps.forEach((powerUp) => powerUp.update(dt, playerPos))
    this.background.update(dt, this.velocity)
    this.player.update(dt)

    this.trySpawnAsteroid()

    const playerBounds = this.player.bounds
    const asteroid = this.isCollisionAsteroidDetected(playerBounds)
    const powerUp = this.isCollisionPowerUpDetected(playerBounds)

    if (asteroid) {
      this.audio?.playBeamHit()
      if (this.player?.isDashing) {
        asteroid.destroy(true)
      } else {
        this.player.hp -= asteroid.damage
        asteroid.destroy(false)
      }
    } else {
      this.audio?.stopBeamHit()
    }

    if (powerUp) {
      powerUp.destroy(true)
    }

    // Check beam collision with asteroids
    if (this.player?.beam?.isActive) {
      const beam = this.player.beam.sprite
      // Calculate beam line starting from player position
      const beamLine = new Phaser.Geom.Line(
        this.player.x + this.player.beam.position.x,
        this.player.y + this.player.beam.position.y,
        this.player.x + this.player.beam.position.x + Math.cos(beam.rotation) * beam.displayWidth,
        this.player.y + this.player.beam.position.y + Math.sin(beam.rotation) * beam.displayWidth
      )

      this.asteroids.forEach((asteroid) => {
        const asteroidBounds = asteroid.sprite.getBounds()
        if (Phaser.Geom.Intersects.LineToRectangle(beamLine, asteroidBounds)) {
          asteroid.hp -= this.player?.damage ?? 1
        }
      })
    }
  }

  private trySpawnAsteroid () {
    let spawnRate = config.asteroid.baseSpawnRate / this.velocity
    // if (this.store.score > 2000) {
    //   const scoreModifier = Math.log1p((this.store.score - 2000) / 1000)
    //   spawnRate = spawnRate / (1 + scoreModifier)
    // }
    const scoreModifier = Math.log1p(this.store.score / 1000)
    spawnRate = spawnRate / (1 + scoreModifier)

    const timeSinceLastSpawn = this.time.now - this.lastSpawnTime

    if (timeSinceLastSpawn >= spawnRate) {
      this.lastSpawnTime = this.time.now
      this.spawnAsteroid()
    }
  }

  private isCollisionAsteroidDetected (playerBounds: Phaser.Geom.Rectangle): Asteroid | false {
    if (this.store.debug.isCollisionDisabled) return false
    for (const asteroid of this.asteroids) {
      const asteroidBounds = asteroid.sprite.getBounds()
      if (Phaser.Geom.Rectangle.Overlaps(playerBounds, asteroidBounds)) {
        return asteroid
      }
    }
    return false
  }

  private isCollisionPowerUpDetected (playerBounds: Phaser.Geom.Rectangle): PowerUp | false {
    for (const powerUp of this.powerUps) {
      const powerUpBounds = powerUp.sprite.getBounds()
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, powerUpBounds)) {
        return powerUp
      }
    }
    return false
  }

  public spawnAsteroid () {
    // this.asteroidSpeed = 1 + Math.log1p(this.store.score / 2000) * 1.5 + Math.pow(this.store.score / 5000, 1.05)
    // this.asteroidSpeed = clamp(this.asteroidSpeed, 1, this.velocity * 0.8)
    this.asteroidSpeed = this.velocity * 0.5

    const asteroid = new Asteroid(this, {
      maxSpeed: this.asteroidSpeed,
      isLarge: Math.random() > 0.75,
      onDestroy: this.onDestroyAsteroid.bind(this),
    })

    this.asteroids.push(asteroid)
  }

  public spawnPowerUp (position: { x: number; y: number }, isLarge: boolean) {
    const powerUp = new PowerUp(this, {
      position,
      isLarge,
      speed: this.asteroidSpeed,
      onDestroy: this.onDestroyPowerUp.bind(this)
    })
    this.powerUps.push(powerUp)
  }

  private onDestroyAsteroid (id: string, options?: KeyDict<any>) {
    this.asteroids = this.asteroids.filter((asteroid) => asteroid.id !== id)
    if (!options?.isDestroyedByPlayer) return
    this.store.increaseScore(options.isLarge ? config.asteroid.large.score : config.asteroid.small.score)
    if (Math.random() <= config.powerUp.baseSpawnRate) return
    this.spawnPowerUp(options.position, options.isLarge)
  }

  private onDestroyPowerUp (id: string, options?: KeyDict<any>) {
    this.powerUps = this.powerUps.filter((powerUp) => powerUp.id !== id)
    if (!options?.isDestroyedByPlayer || !this.player) return
    switch (options.type) {
      case PowerUpType.HpLarge:
        this.player.hp += config.powerUp.hpLarge
        break
      case PowerUpType.HpMedium:
        this.player.hp += config.powerUp.hpMedium
        break
      case PowerUpType.HpSmall:
        this.player.hp += config.powerUp.hpSmall
        break
      case PowerUpType.EnergyLarge:
        this.player.energy += config.powerUp.energyLarge
        break
      case PowerUpType.EnergyMedium:
        this.player.energy += config.powerUp.energyMedium
        break
      case PowerUpType.EnergySmall:
      default:
        this.player.energy += config.powerUp.energySmall
        break
    }
  }
}
