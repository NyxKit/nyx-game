import useSettingsStore from '@/stores/settings'
import type { KeyDict } from 'nyx-kit/types'
import { EventBus } from '@/classes'
import type { GameScene } from '@/scenes'
import { GameEvents } from './EventBus'

interface AudioEventOptions {
  volume: number
  fade: boolean
  duration: number
  force: boolean
  cooldown: number //ms
}

const DEFAULT_AUDIO_EVENT_OPTIONS: AudioEventOptions = {
  volume: 1,
  fade: false,
  duration: 200,
  force: false,
  cooldown: 0
}

export class Audio {
  private scene: GameScene
  private store = useSettingsStore()
  public soundtracks: Phaser.Sound.WebAudioSound[] = []
  public sfx: KeyDict<Phaser.Sound.WebAudioSound | null> = {
    playerBeam: null,
    playerDamage: null,
    playerDash: null,
    playerDeath: null,
    playerScream: null,
    asteroidExplosion: null,
    powerUp: null,
    noEnergy: null
  }
  private lastPlay: KeyDict<number> = {
    playerBeam: 0,
    playerDamage: 0,
    playerDash: 0,
    playerDeath: 0,
    playerScream: 0,
    asteroidExplosion: 0,
    powerUp: 0,
    noEnergy: 0
  }

  constructor (scene: GameScene) {
    this.scene = scene
    const volume = this.store.currentVolume

    this.soundtracks = [
      this.scene.sound.add('soundtrack/0', { loop: false, volume: volume * 0.8 }) as Phaser.Sound.WebAudioSound,
      this.scene.sound.add('soundtrack/1', { loop: false, volume: volume * 0.8 }) as Phaser.Sound.WebAudioSound,
      this.scene.sound.add('soundtrack/2', { loop: false, volume: volume * 0.8 }) as Phaser.Sound.WebAudioSound,
      this.scene.sound.add('soundtrack/3', { loop: false, volume: volume * 0.8 }) as Phaser.Sound.WebAudioSound
    ]

    this.sfx = {
      playerBeam: this.scene.sound.add('playerBeam', { volume: 0, loop: true }) as Phaser.Sound.WebAudioSound,
      playerDamage: this.scene.sound.add('playerDamage', { volume }) as Phaser.Sound.WebAudioSound,
      playerDash: this.scene.sound.add('playerDash', { volume }) as Phaser.Sound.WebAudioSound,
      playerDeath: this.scene.sound.add('playerDeath', { volume }) as Phaser.Sound.WebAudioSound,
      playerScream: this.scene.sound.add('playerScream', { volume: volume * 0.5 }) as Phaser.Sound.WebAudioSound,
      asteroidExplosion: this.scene.sound.add('asteroidExplosion', { volume }) as Phaser.Sound.WebAudioSound,
      powerUp: this.scene.sound.add('powerUp', { volume }) as Phaser.Sound.WebAudioSound,
      noEnergy: this.scene.sound.add('noEnergy', { volume }) as Phaser.Sound.WebAudioSound
    }

    for (const key in this.sfx) {
      if (!this.sfx[key]?.loop) continue
      this.sfx[key].play()
    }

    EventBus.on(GameEvents.SetVolume, this.updateVolume.bind(this))
  }

  private updateVolume (volume: number) {
    this.scene.sound.setVolume(volume)
  }

  public playSoundtrack (index: number = 0) {
    if (this.soundtracks.length === 0) return
    const track = this.soundtracks[index]
    const newIndex = (index + 1) % this.soundtracks.length
    track.once('complete', () => this.playSoundtrack(newIndex))
    track.play()
  }

  public playSfx (key: keyof typeof this.sfx, options: Partial<AudioEventOptions> = DEFAULT_AUDIO_EVENT_OPTIONS) {
    const _options: AudioEventOptions = { ...DEFAULT_AUDIO_EVENT_OPTIONS, ...options }
    const sfx = this.sfx[key]!
    if (sfx.isPlaying && !sfx.loop && !_options.force) return
    const now = this.scene.time.now
    if (_options.cooldown > 0 && now - this.lastPlay[key] < _options.cooldown) return
    const useTween = _options.fade || sfx.loop
    if (!useTween) {
      sfx.play()
    } else {
      this.scene.tweens.killTweensOf(sfx)
      if (!sfx.loop) {
        sfx.setVolume(0)
        sfx.play()
      }
      const targetVolume = this.store.currentVolume * _options.volume
      this.scene.tweens.add({
        targets: sfx,
        volume: targetVolume,
        duration: _options.duration,
        ease: 'Linear'
      })
    }
    if (_options.cooldown > 0) {
      this.lastPlay[key] = now
    } else {
      this.lastPlay[key] = 0
    }
  }

  public stopSfx (key: keyof typeof this.sfx, options: Partial<AudioEventOptions> = DEFAULT_AUDIO_EVENT_OPTIONS) {
    const _options: AudioEventOptions = { ...DEFAULT_AUDIO_EVENT_OPTIONS, ...options }
    const sfx = this.sfx[key]!
    const useTween = _options.fade || sfx.loop
    if (!useTween) {
      sfx.stop()
    } else {
      const tween = this.scene.tweens.add({
        targets: sfx,
        volume: 0,
        duration: _options.duration,
        ease: 'Linear'
      })
      if (sfx.loop) return
      tween.on('complete', () => sfx.stop())
    }
    this.lastPlay[key] = 0
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
