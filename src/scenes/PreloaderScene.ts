import { EventBus } from '@/classes'
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
    this.load.image('powerup/pink0', 'powerup/pink0.png')
    this.load.image('powerup/pink1', 'powerup/pink1.png')
    this.load.image('powerup/pink2', 'powerup/pink2.png')
    this.load.image('powerup/blue1', 'powerup/blue1.png')
    this.load.image('powerup/blue2', 'powerup/blue2.png')
  }

  create () {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    EventBus.emit('preload-complete', this)
    this.scene.start('Game')
  }
}
