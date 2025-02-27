import { AUTO, Game } from 'phaser'
import { BootScene, PreloaderScene, GameScene, GameOverScene } from '@/game/scenes'
import useClientStore from '@/stores/client'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  backgroundColor: '#028af8',
  scene: [
    BootScene,
    PreloaderScene,
    GameScene,
    GameOverScene
  ]
}

const StartGame = (parent: string) => {
  return new Game({ ...config, parent })
}

export default StartGame
