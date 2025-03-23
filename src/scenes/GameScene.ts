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
import type { Types } from 'phaser'

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
  private line: Phaser.GameObjects.Line | null = null

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
    this.lastSpawnTime = 0
    this.togglePaused(false)
  }

  public togglePaused (isPaused: boolean) {
    if (isPaused) {
      this.physics.pause()
      this.scene.pause()
    } else {
      this.physics.resume()
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

    createSpriteAnimation(this.anims, 'explosion/md', 'explosion/md', [0, 1, 2, 3], 0)

    // Set up collision groups
    if (this.player) {
      // Initial asteroids will be handled when spawned
      this.asteroids.forEach(asteroid => {
        if (asteroid.sprite instanceof Phaser.Physics.Arcade.Sprite) {
          this.physics.add.collider(
            this.player!,
            asteroid.sprite,
            this.handlePlayerAsteroidCollision.bind(this) as Types.Physics.Arcade.ArcadePhysicsCallback
          )
        }
      })
    }

    EventBus.emit(GameEvents.CurrentSceneReady, this)
  }

  update (time: number, delta: number) {
    if (!this.player || !this.background) return
    if (this.store.isPaused) return

    const dt = delta / 1000

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

    if (this.line) {
      this.line.destroy()
    }

    // Check beam collision with asteroids
    if (this.player?.beam?.isActive) {
      const beam = this.player.beam.sprite
      // Calculate beam line starting from player position
      const beamLine = new Phaser.Geom.Line(
        this.player.x + this.player.beam.sprite.x,
        this.player.y + this.player.beam.sprite.y,
        this.player.x + this.player.beam.sprite.x + Math.cos(beam.rotation) * beam.displayWidth,
        this.player.y + this.player.beam.sprite.y + Math.sin(beam.rotation) * beam.displayWidth
      )

      this.line = this.add.line(0, 0, beamLine.x1, beamLine.y1, beamLine.x2, beamLine.y2, 0xff0000).setOrigin(0, 0).setDepth(2000)

      this.asteroids.forEach((asteroid) => {
        const asteroidBounds = asteroid.sprite.getBounds()
        if (Phaser.Geom.Intersects.LineToRectangle(beamLine, asteroidBounds)) {
          asteroid.hp -= this.player?.damage ?? 1
        }
      })
    }
  }

  private handlePlayerAsteroidCollision(
    playerObj: Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    asteroidObj: Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (this.store.debug.isCollisionDisabled) return

    // Type guard to ensure we have the correct types
    if (!this.player) return
    if (!(playerObj instanceof Phaser.GameObjects.Container)) return
    if (!(asteroidObj instanceof Phaser.Physics.Arcade.Sprite)) return

    const asteroid = this.asteroids.find((a) => a.sprite === asteroidObj)
    if (!asteroid) return

    this.audio?.playBeamHit()
    if (this.player.isDashing) {
      asteroid.destroy(true)
    } else {
      this.player.hp -= asteroid.damage
      asteroid.destroy(false)
    }
  }

  private trySpawnAsteroid () {
    let spawnRate = config.asteroid.baseSpawnRate / this.velocity
    const scoreModifier = Math.log1p(this.store.score / 1000)
    spawnRate = spawnRate / (1 + scoreModifier)

    const timeSinceLastSpawn = this.time.now - this.lastSpawnTime

    if (timeSinceLastSpawn >= spawnRate) {
      this.lastSpawnTime = this.time.now
      this.spawnAsteroid()
    }
  }

  public spawnAsteroid () {
    this.asteroidSpeed = this.velocity * 0.5

    const asteroid = new Asteroid(this, {
      maxSpeed: this.asteroidSpeed,
      isLarge: Math.random() > 0.75,
      onDestroy: this.onDestroyAsteroid.bind(this),
    })

    this.asteroids.push(asteroid)

    // Add the new asteroid to the collision system
    if (this.player) {
      this.physics.add.collider(
        this.player,
        asteroid.sprite,
        this.handlePlayerAsteroidCollision.bind(this) as Types.Physics.Arcade.ArcadePhysicsCallback
      )
    }
  }

  public spawnPowerUp (position: { x: number; y: number }, isLarge: boolean) {
    const powerUp = new PowerUp(this, {
      position,
      isLarge,
      speed: this.asteroidSpeed,
      onDestroy: this.onDestroyPowerUp.bind(this)
    })
    this.powerUps.push(powerUp)

    // Add overlap detection with player
    if (this.player) {
      this.physics.add.overlap(
        this.player,
        powerUp.sprite,
        () => powerUp.destroy(true)
      )
    }
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
