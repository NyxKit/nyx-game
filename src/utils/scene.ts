import { GameScene } from '@/scenes'

export const createTiledImage = (
  scene: Phaser.Scene,
  key: string,
  options?: { depth?: number, alpha?: number }
): Phaser.GameObjects.TileSprite => {
  const srcHeight = scene.textures.get(key).getSourceImage().height
  return scene.add.tileSprite(0, 0, scene.scale.width, scene.scale.height, key)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setScale(scene.scale.height / srcHeight)
    .setDepth(options?.depth ?? 0)
    .setAlpha(options?.alpha ?? 1)
}

export const createSpriteAnimation = (
  anims: Phaser.Animations.AnimationManager,
  key: string,
  src: string,
  frames?: number[],
  repeat: number = -1,
) => {
  return anims.create({
    key,
    frames: anims.generateFrameNames(src, { frames }),
    frameRate: 10,
    repeat: repeat
  })
}

export const isGameScene = (scene: Phaser.Scene): scene is GameScene => scene instanceof GameScene
