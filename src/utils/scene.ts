interface CreateTiledImageOptions {
  depth?: number
  alpha?: number
}

export const createTiledImage = (
  scene: Phaser.Scene,
  key: string,
  options?: CreateTiledImageOptions
): Phaser.GameObjects.TileSprite => {
  const srcHeight = scene.textures.get(key).getSourceImage().height
  return scene.add.tileSprite(0, 0, scene.scale.width, scene.scale.height, key)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setScale(scene.scale.height / srcHeight)
    .setDepth(options?.depth ?? 0)
    .setAlpha(options?.alpha ?? 1)
}

