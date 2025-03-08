import { Scene } from 'phaser'
import useSettingsStore from '@/stores/settings'
import type { KeyDict } from 'nyx-kit/types'
import { EventBus } from '@/classes'
import type { GameScene } from '@/scenes'
import { GameEvents } from './EventBus'

export class Audio {
  private scene: GameScene
  private store = useSettingsStore()
  public soundtrack: Phaser.Sound.WebAudioSound | null = null
  public sfx: KeyDict<Phaser.Sound.WebAudioSound | null> = {
    playerBeam: null,
    playerDamage: null,
    playerDash: null,
    playerDeath: null,
  }

  constructor (scene: GameScene) {
    this.scene = scene

    const volume = this.store.currentVolume

    this.soundtrack = this.scene.sound.add('soundtrack', { loop: true, volume: volume * 0.8 }) as Phaser.Sound.WebAudioSound
    this.sfx = {
      playerBeam: this.scene.sound.add('playerBeam', { volume: 0, loop: true }) as Phaser.Sound.WebAudioSound,
      playerDamage: this.scene.sound.add('playerDamage', { volume }) as Phaser.Sound.WebAudioSound,
      playerDash: this.scene.sound.add('playerDash', { volume }) as Phaser.Sound.WebAudioSound,
      playerDeath: this.scene.sound.add('playerDeath', { volume }) as Phaser.Sound.WebAudioSound
    }

    for (const key in this.sfx) {
      if (!this.sfx[key]?.loop) continue
      this.sfx[key].play()
    }

    EventBus.on(GameEvents.SetVolume, (volume: number) => {
      this.updateVolume(volume)
    })
  }

  private updateVolume (volume: number) {
    this.scene.sound.setVolume(volume)
  }

  public playSfx (key: keyof typeof this.sfx) {
    const sfx = this.sfx[key]!
    if (!sfx.loop) {
      sfx.play()
    } else {
      this.scene.tweens.killTweensOf(sfx)
      this.scene.tweens.add({
        targets: sfx,
        volume: this.store.currentVolume,
        duration: 200,
        ease: 'Linear'
      })
    }
  }

  public stopSfx (key: keyof typeof this.sfx) {
    const sfx = this.sfx[key]!
    if (!sfx.loop) {
      sfx.stop()
    } else {
      this.scene.tweens.killTweensOf(sfx)
      this.scene.tweens.add({
        targets: sfx,
        volume: 0,
        duration: 200,
        ease: 'Linear'
      })
    }
  }

  stopAll () {
    this.scene.sound.stopAll()
  }
}
