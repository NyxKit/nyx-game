import { AUTO, Game } from 'phaser'
import { BootScene, PreloaderScene, GameScene } from '@/scenes'

const params = new URLSearchParams(document.location.search)
const fps = params.get('fps') ?? '0'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  backgroundColor: '#000000',
  pixelArt: true,
  fps: {
    limit: parseInt(fps),
    // forceSetTimeOut: true
  },
  scene: [
    BootScene,
    PreloaderScene,
    GameScene
  ]
}

const StartGame = (parent: string) => {
  return new Game({ ...config, parent })
}

export default StartGame
