import useGameStore from '@/stores/game'

export default class GameControls {
  public left: boolean = false
  public right: boolean = false
  public up: boolean = false
  public down: boolean = false
  public space: boolean = false
  public esc: boolean = false
  public special1: boolean = false
  public special2: boolean = false
  private store = useGameStore()

  constructor (keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    keyboard.on('keydown', (event: KeyboardEvent) => {
      if (!this.store.isPlaying) return

      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.left = true
          break
        case 'ArrowRight':
        case 'KeyD':
          this.right = true
          break
        case 'ArrowUp':
        case 'KeyW':
          this.up = true
          break
        case 'ArrowDown':
        case 'KeyS':
          this.down = true
          break
        case 'Space':
          this.space = true
          break
        case 'Escape':
          this.esc = true
          break
        case 'KeyE':
          this.special1 = true
          break
        case 'KeyQ':
          this.special2 = true
          break
      }
    })

    keyboard.on('keyup', (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.left = false
          break
        case 'ArrowRight':
        case 'KeyD':
          this.right = false
          break
        case 'ArrowUp':
        case 'KeyW':
          this.up = false
          break
        case 'ArrowDown':
        case 'KeyS':
          this.down = false
          break
        case 'Space':
          this.space = false
          break
        case 'Escape':
          this.esc = false
          break
        case 'KeyE':
          this.special1 = false
          break
        case 'KeyQ':
          this.special2 = false
          break
      }
    })
  }
}
