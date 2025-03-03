import { Scene } from 'phaser'
import { EventBus, GameControls, Player, Background, Asteroid } from '@/classes'
import useGameStore from '@/stores/game'
import { clamp } from 'nyx-kit/utils'
import { PowerUpType } from '@/types'
import type { KeyDict } from 'nyx-kit/types'
import PowerUp from '@/classes/PowerUp'

export class GameScene extends Scene {
  private controls: GameControls | null = null
  private background: Background | null = null
  private player: Player | null = null
  private store = useGameStore()
  private velocity = 1
  private asteroids: Asteroid[] = []
  private lastSpawnTime = 0
  private powerUps: PowerUp[] = []
  
  constructor () {
    super('Game')
  }

  reset () {
    this.asteroids = []
    this.powerUps = []
    this.lastSpawnTime = 0
    this.scene.restart()
  }

  create () {
    if (!this.input.keyboard) {
      throw new Error('No keyboard input found')
    }

    this.controls = new GameControls(this.input.keyboard)
    this.background = new Background(this, this.controls)
    this.player = new Player(this, this.controls)
    this.player.setDepth(1000)
    this.player.setPosition(200, this.scale.height / 2)

    EventBus.emit('current-scene-ready', this)
  }

  update () {
    if (!this.player || !this.background) return

    this.velocity = 1 + Math.log10(Math.max(1, this.store.score / 1000)) * 2 + Math.pow(this.store.score / 1000, 1.1)
    this.velocity = clamp(this.velocity, 1, 15)

    if (!this.store.isPlaying) {
      this.background.update(this.velocity)
      return
    }

    if (this.store.isPaused) return

    const playerPos = this.player!.currentPosition

    this.asteroids.forEach((asteroid) => asteroid.update())
    this.powerUps.forEach((powerUp) => powerUp.update(playerPos))
    this.background.update(this.velocity)
    this.player.update(this.velocity)

    this.trySpawnAsteroid()
    const asteroid = this.isCollisionAsteroidDetected()
    const powerUp = this.isCollisionPowerUpDetected()

    if (asteroid) {
      if (!this.store.debug.isImmortal) this.store.decreaseHp(10)
      asteroid.destroy()
    }

    if (powerUp) {
      switch (powerUp.type) {
        case PowerUpType.Default:
          this.store.increaseEnergy(1)
          break
        case PowerUpType.Energy:
          this.store.increaseEnergy(100)
          break
        case PowerUpType.Shield:
          // this.store.increaseShield(100)
          break
      }
      powerUp.destroy()
    }

    // Check beam collision with asteroids
    if (this.player?.beam) {
      const beam = this.player.beam
      const beamLine = new Phaser.Geom.Line(
        this.player.beamOrigin.x,
        this.player.beamOrigin.y,
        this.player.beamOrigin.x + Math.cos(beam.rotation) * beam.width,
        this.player.beamOrigin.y + Math.sin(beam.rotation) * beam.width
      )

      this.asteroids.forEach((asteroid) => {
        const asteroidBounds = asteroid.sprite.getBounds()
        if (Phaser.Geom.Intersects.LineToRectangle(beamLine, asteroidBounds)) {
          asteroid.destroy(true)
        }
      })
    }

    const playerBounds = this.player!.sprite.getBounds()
    // Check powerup collision with player
    this.powerUps.forEach((powerUp) => {
      const powerUpBounds = powerUp.sprite.getBounds()
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, powerUpBounds)) {
        powerUp.destroy()
      }
    })
  }

  private trySpawnAsteroid () {
    const spawnRate = this.store.debug.isImmortal ? 1000 : 5000 / this.velocity
    const timeSinceLastSpawn = this.time.now - this.lastSpawnTime

    if (timeSinceLastSpawn >= spawnRate) {
      this.lastSpawnTime = this.time.now
      this.spawnAsteroid()
    }
  }

  private isCollisionAsteroidDetected (): Asteroid | false {
    if (this.player?.sprite && !this.store.debug.isCollisionDisabled) {
      const playerBounds = this.player.sprite.getBounds()

      for (const asteroid of this.asteroids) {
        const asteroidBounds = asteroid.sprite.getBounds()
        
        if (Phaser.Geom.Rectangle.Overlaps(playerBounds, asteroidBounds)) {
          return asteroid
        }
      }
    }

    return false
  }

  private isCollisionPowerUpDetected (): PowerUp | false {
    if (this.player?.sprite && !this.store.debug.isCollisionDisabled) {
      const playerBounds = this.player.sprite.getBounds()

      for (const powerUp of this.powerUps) {
        const powerUpBounds = powerUp.sprite.getBounds()
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, powerUpBounds)) {
          return powerUp
        }
      }
    }

    return false
  }

  spawnAsteroid () {
    const asteroid = new Asteroid(this, {
      speed: this.velocity,
      onDestroy: this.onDestroyAsteroid.bind(this)
    })

    this.asteroids.push(asteroid)
  }

  spawnPowerUp (position: { x: number; y: number }) {
    const powerUp = new PowerUp(this, {
      type: PowerUpType.Default,
      position,
      onDestroy: this.onDestroyPowerUp.bind(this)
    })
    this.powerUps.push(powerUp)
  }

  private onDestroyAsteroid (id: string, options?: KeyDict<any>) {
    this.asteroids = this.asteroids.filter((asteroid) => asteroid.id !== id)
    if (!options?.isDestroyedByPlayer) return
    this.store.increaseScore(50)
    this.spawnPowerUp(options.position)
  }

  private onDestroyPowerUp (id: string, options?: KeyDict<any>) {
    this.powerUps = this.powerUps.filter((powerUp) => powerUp.id !== id)
    if (!options?.isDestroyedByPlayer) return
    if (options.type === PowerUpType.Energy) {
      this.store.increaseEnergy(100)
    } else if (options.type === PowerUpType.Shield) {
      // this.store.increaseShield(100)
    }
  }
}
