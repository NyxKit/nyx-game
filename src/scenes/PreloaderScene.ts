import { EventBus } from '@/classes'
import { GameEvents } from '@/classes/EventBus'
import useGameStore from '@/stores/game'
import { Scene } from 'phaser'

export class PreloaderScene extends Scene {
  constructor () {
    super('Preloader')
  }

  init () {
    const { setPreloadProgress } = useGameStore()
    this.load.on('progress', (progress: number) => {
      setPreloadProgress(progress)
    })
  }

  preload () {
    this.load.setPath('assets')
    this.load.image('player', 'whale.png')
    this.load.image('blackhole', 'blackhole.png')

    this.load.image('background/stars', 'background/stars.png')
    this.load.image('background/dust', 'background/dust.png')
    this.load.image('background/nebulae', 'background/nebulae.png')
    this.load.image('background/planets', 'background/planets.png')

    this.load.image('asteroid/1', 'asteroid/1.png')
    this.load.image('asteroid/2', 'asteroid/2.png')
    this.load.image('asteroid/3', 'asteroid/3.png')
    this.load.image('asteroid/4', 'asteroid/4.png')
    this.load.image('asteroid/5', 'asteroid/5.png')
    this.load.image('asteroid/6', 'asteroid/6.png')

    this.load.image('powerup/hp-small', 'powerup/pink0.png')
    this.load.image('powerup/hp-medium', 'powerup/pink1.png')
    this.load.image('powerup/hp-large', 'powerup/pink2.png')
    this.load.image('powerup/energy-small', 'powerup/blue0.png')
    this.load.image('powerup/energy-medium', 'powerup/blue1.png')
    this.load.image('powerup/energy-large', 'powerup/blue2.png')

    this.load.spritesheet('beam', 'beam.png', { frameWidth: 64, frameHeight: 64 })

    // this.load.spritesheet('explosion/sm', 'explosion/sm.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('explosion/md', 'explosion/md.png', { frameWidth: 32, frameHeight: 32 })
    // this.load.spritesheet('explosion/lg', 'explosion/lg.png', { frameWidth: 48, frameHeight: 48 })

    // this.load.atlas('beam', 'beam.png', 'beam.json')

    this.load.audio('soundtrack', 'soundtracks/OutOfTheOrbit.mp3')
    this.load.audio('playerDamage', 'sfx/playerDamage.mp3')
    this.load.audio('playerBeam', 'sfx/playerBeam.mp3')
    this.load.audio('playerDash', 'sfx/playerDash.mp3')
    this.load.audio('playerDeath', 'sfx/playerDeath.mp3')
    this.load.audio('playerScream', 'sfx/playerScream.mp3')
  }

  create () {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    EventBus.emit(GameEvents.PreloadComplete, this)
    this.scene.start('Game')
  }
}
