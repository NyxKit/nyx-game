import { EventBus } from '@/classes/EventBus'
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
    this.load.image('star', 'star.png')
    this.load.image('bg_stars', 'bg_stars.png')
    this.load.image('bg_dust', 'bg_dust.png')
    this.load.image('bg_nebulae', 'bg_nebulae.png')
    this.load.image('bg_planets', 'bg_planets.png')
  }

  create () {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    EventBus.emit('preload-complete', this)
    this.scene.start('Game')
  }
}
