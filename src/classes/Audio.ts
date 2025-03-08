import { Scene } from 'phaser'
import useSettingsStore from '@/stores/settings'
import type { KeyDict } from 'nyx-kit/types'
import { EventBus } from '@/classes'

export class Audio {
  private scene: Scene
  private store = useSettingsStore()
  public soundtrack: Phaser.Sound.WebAudioSound | null = null
  public sfx: KeyDict<Phaser.Sound.WebAudioSound | null> = {
    playerBeam: null, // TODO: continuously play this, ease volume in and out
    playerDamage: null,
    playerDash: null,
    playerDeath: null,
  }

  constructor (scene: Scene) {
    this.scene = scene

    const volume = this.store.currentVolume

    this.soundtrack = this.scene.sound.add('soundtrack', { loop: true, volume }) as Phaser.Sound.WebAudioSound
    this.sfx = {
      playerBeam: this.scene.sound.add('playerBeam', { volume }) as Phaser.Sound.WebAudioSound,
      playerDamage: this.scene.sound.add('playerDamage', { volume }) as Phaser.Sound.WebAudioSound,
      playerDash: this.scene.sound.add('playerDash', { volume }) as Phaser.Sound.WebAudioSound,
      playerDeath: this.scene.sound.add('playerDeath', { volume }) as Phaser.Sound.WebAudioSound
    }

    EventBus.on('setVolume', (volume: number) => {
      this.updateVolume(volume)
    })
  }

  private updateVolume (volume: number) {
    this.scene.sound.setVolume(volume)
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
