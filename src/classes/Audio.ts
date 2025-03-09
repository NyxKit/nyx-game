import { Scene } from 'phaser'
import useSettingsStore from '@/stores/settings'
import type { KeyDict } from 'nyx-kit/types'
import { EventBus } from '@/classes'
import type { GameScene } from '@/scenes'
import { GameEvents } from './EventBus'

interface AudioEventOptions {
  volume?: number
  fade?: boolean
  duration?: number
}

const DEFAULT_AUDIO_EVENT_OPTIONS: AudioEventOptions = {
  volume: 1,
  fade: false,
  duration: 200
}

export class Audio {
  private scene: GameScene
  private store = useSettingsStore()
  public soundtrack: Phaser.Sound.WebAudioSound | null = null
  public sfx: KeyDict<Phaser.Sound.WebAudioSound | null> = {
    playerBeam: null,
    playerDamage: null,
    playerDash: null,
    playerDeath: null,
    playerScream: null,
    asteroidExplosion: null,
    powerUp: null
  }

  constructor (scene: GameScene) {
    this.scene = scene

    const volume = this.store.currentVolume

    this.soundtrack = this.scene.sound.add('soundtrack', { loop: true, volume: volume * 0.8 }) as Phaser.Sound.WebAudioSound
    this.sfx = {
      playerBeam: this.scene.sound.add('playerBeam', { volume: 0, loop: true }) as Phaser.Sound.WebAudioSound,
      playerDamage: this.scene.sound.add('playerDamage', { volume }) as Phaser.Sound.WebAudioSound,
      playerDash: this.scene.sound.add('playerDash', { volume }) as Phaser.Sound.WebAudioSound,
      playerDeath: this.scene.sound.add('playerDeath', { volume }) as Phaser.Sound.WebAudioSound,
      playerScream: this.scene.sound.add('playerScream', { volume: volume * 0.5 }) as Phaser.Sound.WebAudioSound,
      asteroidExplosion: this.scene.sound.add('asteroidExplosion', { volume }) as Phaser.Sound.WebAudioSound,
      powerUp: this.scene.sound.add('powerUp', { volume }) as Phaser.Sound.WebAudioSound
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

  public playSfx (key: keyof typeof this.sfx, options: AudioEventOptions = DEFAULT_AUDIO_EVENT_OPTIONS) {
    const sfx = this.sfx[key]!
    const useTween = options.fade || sfx.loop
    if (!useTween) {
      sfx.play()
    } else {
      this.scene.tweens.killTweensOf(sfx)
      if (!sfx.loop) {
        sfx.setVolume(0)
        sfx.play()
      }
      const targetVolume = this.store.currentVolume * (options.volume ?? 1)
      const tween = this.scene.tweens.add({
        targets: sfx,
        volume: targetVolume,
        duration: options.duration,
        ease: 'Linear'
      })
    }
  }

  public stopSfx (key: keyof typeof this.sfx, options: AudioEventOptions = DEFAULT_AUDIO_EVENT_OPTIONS) {
    const sfx = this.sfx[key]!
    const useTween = options.fade || sfx.loop
    if (!useTween) {
      sfx.stop()
    } else {
      const tween = this.scene.tweens.add({
        targets: sfx,
        volume: 0,
        duration: options.duration,
        ease: 'Linear'
      })
      if (sfx.loop) return
      tween.on('complete', () => sfx.stop())
    }
  }

  public playAttack () {
    this.playSfx('playerScream', { fade: true })
    this.playSfx('playerBeam', { fade: true, volume: 0.2 })
  }

  public stopAttack () {
    this.stopSfx('playerScream', { fade: true })
    this.stopSfx('playerBeam', { fade: true })
  }

  public playBeamHit () {
    // const sfx = this.sfx.playerBeam
    // if (sfx === null) return
    // this.scene.tweens.killTweensOf(sfx)
    // const tween = this.scene.tweens.add({
    //   targets: sfx,
    //   volume: this.store.currentVolume * 0.4,
    //   duration: 200,
    //   ease: 'Linear'
    // })
  }

  public stopBeamHit () {
    // const sfx = this.sfx.playerBeam
    // if (sfx === null) return
    // this.scene.tweens.killTweensOf(sfx)
    // const tween = this.scene.tweens.add({
    //   targets: sfx,
    //   volume: this.store.currentVolume * 0.2,
    //   duration: 200,
    //   ease: 'Linear'
    // })
  }

  stopAll () {
    this.scene.sound.stopAll()
  }
}
