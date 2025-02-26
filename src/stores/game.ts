import type { IdleScene } from '@/game/scenes'
import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'

const useGameStore = defineStore('game', () => {
  const gameRef = ref()
  const canMoveSprite = ref(false)
  const spritePosition = ref({ x: 0, y: 0 })

  const setGameRef = (ref: HTMLDivElement) => {
    gameRef.value = ref
  }

  const changeScene = () => {
    const scene = toRaw(gameRef.value.scene) as IdleScene
    if (!scene) return
  
    //  Call the changeScene method defined in the `Idle`, `Game` and `GameOver` Scenes
    scene.changeScene()
  }
  
  const moveSprite = () => {
    if (!gameRef.value) return
  
    const scene = toRaw(gameRef.value.scene) as IdleScene
    if (!scene) return
  
    // Get the update logo position
    (scene as IdleScene).moveLogo(({ x, y }) => {
      spritePosition.value = { x, y }
    })
  }
  
  const addSprite = () => {
  
    const scene = toRaw(gameRef.value.scene) as Phaser.Scene
    if (!scene) return
  
    // Add a new sprite to the current scene at a random position
    const x = Phaser.Math.Between(64, scene.scale.width - 64)
    const y = Phaser.Math.Between(64, scene.scale.height - 64)
  
    // `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
    const star = scene.add.sprite(x, y, 'star')
  
    //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
    //  You could, of course, do this from within the Phaser Scene code, but this is just an example
    //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
    scene.add.tween({
      targets: star,
      duration: 500 + Math.random() * 1000,
      alpha: 0,
      yoyo: true,
      repeat: -1
    })
  }
  
  // Event emitted from the PhaserGame component
  const currentScene = (scene: IdleScene) => {
    canMoveSprite.value = (scene.scene.key !== 'Idle')
  }

  return {
    gameRef,
    canMoveSprite,
    spritePosition, 
    setGameRef,
    changeScene,
    moveSprite,
    addSprite,
    currentScene
  }
})

export default useGameStore
