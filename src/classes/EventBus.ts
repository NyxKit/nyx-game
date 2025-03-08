import { Events } from 'phaser'

// Used to emit events between Vue components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
const EventBus = new Events.EventEmitter()

export enum GameEvents {
  PreloadComplete = 'preloadComplete',
  CurrentSceneReady = 'currentSceneReady',
  SetVolume = 'setVolume',
  SetMusicVolume = 'setMusicVolume',
  SetSfxVolume = 'setSfxVolume',
  TogglePaused = 'togglePaused',
}

export default EventBus
