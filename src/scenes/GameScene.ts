import { Scene } from 'phaser'
import { EventBus, GameControls, Player, Background, Asteroid } from '@/classes'
import useGameStore from '@/stores/game'
import { clamp } from 'nyx-kit/utils'
import { GameState } from '@/types'

export class GameScene extends Scene {
  private controls: GameControls | null = null
  private background: Background | null = null
  private player: Player | null = null
  private store = useGameStore()
  private velocity = 1
  private asteroids: Asteroid[] = []
  private lastSpawnTime = 0
  
  constructor () {
    super('Game')
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
    this.velocity = 1 + Math.log10(Math.max(1, this.store.score / 1000)) * 2 + Math.pow(this.store.score / 1000, 1.1)
    this.velocity = clamp(this.velocity, 1, 15)

    if (!this.store.isPlaying) {
      this.background?.update(this.velocity)
      return
    }

    if (this.store.isPaused) return

    this.asteroids.forEach((asteroid) => asteroid.update())
    this.background?.update(this.velocity)
    this.player?.update(this.velocity)

    this.trySpawnAsteroid()
    const asteroid = this.isCollisionDetected()

    if (asteroid) {
      this.store.decreaseHp(this.store.debug.isImmortal ? 0 : 10)
      asteroid.destroy()
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
          asteroid.destroy()
          this.store.increaseScore(50)
        }
      })
    }
  }

  private trySpawnAsteroid () {
    const spawnRate = 5000 / this.velocity
    const timeSinceLastSpawn = this.time.now - this.lastSpawnTime

    if (timeSinceLastSpawn >= spawnRate) {
      this.lastSpawnTime = this.time.now
      this.spawnAsteroid()
    }
  }

  private isCollisionDetected (): Asteroid | false {
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

  spawnAsteroid () {
    const onDestroy = (id: string) => this.asteroids = this.asteroids.filter((asteroid) => asteroid.id !== id)
    const asteroid = new Asteroid(this, { speed: this.velocity, onDestroy })
    this.asteroids.push(asteroid)
  }
}
