import { AUTO, Game } from 'phaser'
import { BootScene, PreloaderScene, GameScene } from '@/scenes'

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
    target: 60,
    min: 60,
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
