import { Scene } from 'phaser'
import { EventBus, GameControls, Player, Background, Asteroid } from '@/classes'
import useGameStore from '@/stores/game'
import { clamp } from 'nyx-kit/utils'
import { PowerUpType } from '@/types'
import type { KeyDict } from 'nyx-kit/types'
import PowerUp from '@/classes/PowerUp'
import { createSpriteAnimation } from '@/utils'

export class GameScene extends Scene {
  private controls: GameControls | null = null
  private background: Background | null = null
  public player: Player | null = null
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
    // this.scene.restart()
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

    // createSpriteAnimation(this.anims, 'explosion-sm', 'explosion/sm', [0, 1, 2, 3], 0)
    createSpriteAnimation(this.anims, 'explosion/md', 'explosion/md', [0, 1, 2, 3], 0) 
    // createSpriteAnimation(this.anims, 'explosion-lg', 'explosion/lg', [0, 1, 2, 3], 0)

    EventBus.emit('current-scene-ready', this)
  }

  update (time: number, delta: number) {
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
    this.player.update(this.velocity, time, delta)

    this.trySpawnAsteroid()
    const asteroid = this.isCollisionAsteroidDetected()
    const powerUp = this.isCollisionPowerUpDetected()

    if (asteroid) {
      if (!this.store.debug.isImmortal) this.store.decreaseHp(10)
      asteroid.destroy()
    }

    if (powerUp) {
      powerUp.destroy(true)
    }

    // Check beam collision with asteroids
    if (this.player?.beam?.isActive) {
      const beam = this.player.beam.sprite
      const beamBounds = this.player.beam.bounds

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
          asteroid.hp -= 1
          if (asteroid.hp <= 0) {
            asteroid.destroy(true)
          }
        }
      })
    }
  }

  private trySpawnAsteroid () {
    const spawnRate = this.store.debug.isImmortal ? 1000 : 3000 / this.velocity
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
      isLarge: Math.random() > 0.8,
      onDestroy: this.onDestroyAsteroid.bind(this),
    })

    this.asteroids.push(asteroid)
  }

  spawnPowerUp (position: { x: number; y: number }, isLarge: boolean) {
    const ratio = this.store.energy / 100
    let type = PowerUpType.Hp
    if (isLarge) {
      type = Math.random() > ratio ? PowerUpType.EnergyCrystal : PowerUpType.HpCrystal
    } else {
      type = Math.random() > ratio ? PowerUpType.Energy : PowerUpType.Hp
    }
    const powerUp = new PowerUp(this, { type, position, speed: this.velocity, onDestroy: this.onDestroyPowerUp.bind(this) })
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
    if (!options?.isDestroyedByPlayer) return
    switch (options.type) {
      case PowerUpType.Hp:
        this.store.increaseHp(1)
        break
      case PowerUpType.HpCrystal:
        this.store.increaseHp(20)
        break
      case PowerUpType.Energy:
        this.store.increaseEnergy(5)
        break
      case PowerUpType.EnergyCrystal:
        this.store.increaseEnergy(25)
        break
      default:
        this.store.increaseHp(1)
        this.store.increaseEnergy(5)
        break
    }
  }
}
