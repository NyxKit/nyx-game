import { Scene } from 'phaser'
import useSettingsStore from '@/stores/settings'

export class Audio {
  private scene: Scene
  private store = useSettingsStore()

  constructor (scene: Scene) {
    this.scene = scene
    this.updateVolumes()
  }

  private updateVolumes () {
    this.scene.sound.setVolume(this.store.sfxVolume)
    this.scene.sound.getAllPlaying().forEach((sound) => {
      if (sound.key === 'music') {
        (sound as Phaser.Sound.WebAudioSound).volume = this.store.musicVolume
      }
    })
  }

  playMusic (key: string, config?: Phaser.Types.Sound.SoundConfig) {
    const music = this.scene.sound.add(key, { 
      ...config,
      loop: true,
      volume: this.store.musicVolume
    })
    music.play()
    return music
  }

  playSfx (key: string, config?: Phaser.Types.Sound.SoundConfig) {
    const sfx = this.scene.sound.add(key, {
      ...config,
      volume: this.store.sfxVolume
    })
    sfx.play()
    return sfx
  }

  stopAll () {
    this.scene.sound.stopAll()
  }

  stopMusic () {
    this.scene.sound.stopByKey('music')
  }

  stopSfx () {
    this.scene.sound.getAllPlaying().forEach((sound) => {
      if (sound.key !== 'music') {
        sound.stop()
      }
    })
  }
}
