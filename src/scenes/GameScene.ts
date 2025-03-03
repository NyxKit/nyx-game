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

    // Check for collisions between player and asteroids
    if (this.player?.sprite && !this.store.debug.isCollisionDisabled) {
      const playerBounds = this.player.sprite.getBounds()
      
      for (const asteroid of this.asteroids) {
        const asteroidBounds = asteroid.sprite.getBounds()
        
        if (Phaser.Geom.Rectangle.Overlaps(playerBounds, asteroidBounds)) {
          // Player hit asteroid
          this.store.setGameState(GameState.GameOver)
          break
        }
      }
    }
  }

  spawnAsteroid () {
    const onDestroy = (id: string) => this.asteroids = this.asteroids.filter((asteroid) => asteroid.id !== id)
    const asteroid = new Asteroid(this, { speed: this.velocity, onDestroy })
    this.asteroids.push(asteroid)
  }
}
