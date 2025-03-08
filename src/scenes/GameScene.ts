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

export class GameScene extends Scene {
  private controls: GameControls | null = null
  private background: Background | null = null
  public player: Player | null = null
  public velocity = 1
  private store = useGameStore()
  private asteroids: Asteroid[] = []
  private lastSpawnTime = 0
  private powerUps: PowerUp[] = []
  public audio: Audio | null = null
  
  constructor () {
    super('Game')
  }

  reset () {
    this.asteroids.forEach((asteroid) => asteroid.destroy())
    this.asteroids = []
    this.powerUps.forEach((powerUp) => powerUp.destroy())
    this.powerUps = []
    this.player?.setPosition(200, this.scale.height / 2)
    this.player?.beam?.end()
    // this.audio?.soundtrack?.stop()
    // this.audio = null
    this.lastSpawnTime = 0
    // this.scene.restart()
  }

  public togglePaused () {
    this.store.togglePaused()
    if (this.store.isPaused) {
      this.scene.pause()
    } else {
      this.scene.resume()
    }
  }

  create () {
    if (!this.input.keyboard) {
      throw new Error('No keyboard input found')
    }

    console.log('addding audio class')
    this.audio = new Audio(this)
    console.log('playing soundtrack')
    this.audio.soundtrack?.play()

    this.controls = new GameControls(this.input.keyboard)
    this.background = new Background(this, this.controls)
    this.player = new Player(this, this.controls)
    this.player.setDepth(1000)
    this.player.setPosition(200, this.scale.height / 2)

    // createSpriteAnimation(this.anims, 'explosion-sm', 'explosion/sm', [0, 1, 2, 3], 0)
    createSpriteAnimation(this.anims, 'explosion/md', 'explosion/md', [0, 1, 2, 3], 0) 
    // createSpriteAnimation(this.anims, 'explosion-lg', 'explosion/lg', [0, 1, 2, 3], 0)

    EventBus.emit('current-scene-ready', this)
  }

  update (time: number, delta: number) {
    if (!this.player || !this.background) return
    if (this.store.isPaused) return

    this.velocity = 1 + Math.log10(Math.max(1, this.store.score / 1000)) * 2 + Math.pow(this.store.score / 1000, 1.1)
    // this.velocity = 1 + Math.log1p(Math.max(1, this.store.score / 1000)) * 3 + Math.pow(this.store.score / 1000, 1.05)
    this.velocity = clamp(this.velocity, 1, 20)

    if (!this.store.isInGame) {
      this.background.update(this.velocity)
      return
    }

    if (!this.store.isPlaying) return

    const playerPos = this.player.currentPosition

    this.asteroids.forEach((asteroid) => asteroid.update())
    this.powerUps.forEach((powerUp) => powerUp.update(playerPos))
    this.background.update(this.velocity)
    this.player.update(this.velocity, time, delta)

    this.trySpawnAsteroid()

    const playerBounds = this.player.bounds
    const asteroid = this.isCollisionAsteroidDetected(playerBounds)
    const powerUp = this.isCollisionPowerUpDetected(playerBounds)

    if (asteroid) {
      if (this.player?.isDashing) {
        this.player.hp -= asteroid.damage * config.player.dashDamageReduction
        asteroid.destroy(true)
      } else {
        this.player.hp -= asteroid.damage
        asteroid.destroy(false)
      }
    }

    if (powerUp) {
      powerUp.destroy(true)
    }

    // Check beam collision with asteroids
    if (this.player?.beam?.isActive) {
      const beam = this.player.beam.sprite
      // Calculate beam line starting from player position
      const beamLine = new Phaser.Geom.Line(
        this.player.x + (this.player.sprite.width / 2) - 50,
        this.player.y,
        this.player.x + Math.cos(beam.rotation) * beam.displayWidth,
        this.player.y + Math.sin(beam.rotation) * beam.displayWidth
      )

      // Draw debug line
      // this.line = this.add.line(
      //   0,
      //   0,
      //   beamLine.x1,
      //   beamLine.y1,
      //   beamLine.x2, 
      //   beamLine.y2,
      //   0xff0000
      // ).setOrigin(0, 0).setDepth(2000)
      
      this.asteroids.forEach((asteroid) => {
        const asteroidBounds = asteroid.sprite.getBounds()
        if (Phaser.Geom.Intersects.LineToRectangle(beamLine, asteroidBounds)) {
          asteroid.hp -= this.player?.damage ?? 1
        }
      })
    }
  }

  private trySpawnAsteroid () {
    const spawnRate = config.asteroid.baseSpawnRate / this.velocity
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

  spawnAsteroid () {
    const asteroid = new Asteroid(this, {
      maxSpeed: this.velocity,
      isLarge: Math.random() > 0.8,
      onDestroy: this.onDestroyAsteroid.bind(this),
    })

    this.asteroids.push(asteroid)
  }

  spawnPowerUp (position: { x: number; y: number }, isLarge: boolean) {
    const powerUp = new PowerUp(this, {
      position,
      isLarge,
      speed:this.velocity,
      onDestroy: this.onDestroyPowerUp.bind(this)
    })
    this.powerUps.push(powerUp)
  }

  private onDestroyAsteroid (id: string, options?: KeyDict<any>) {
    this.asteroids = this.asteroids.filter((asteroid) => asteroid.id !== id)
    if (!options?.isDestroyedByPlayer) return
    this.store.increaseScore(Math.round(options.size * 2))
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
