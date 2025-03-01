export const createBackgroundStitched = (scene: Phaser.Scene, key: string, num: number, scrollFactor: number) => {
  let x = 0
  for (let i = 0; i < num; i++) {
    const img = scene.add.image(x, 0, key)
      .setOrigin(0, 0)
      .setDisplaySize(scene.scale.width * 7, scene.scale.height) // this.w * 7.5, this.h + 20
      .setScrollFactor(scrollFactor)
    x += img.width
  }
}

export const createBackgroundTiled = (scene: Phaser.Scene, key: string, depth: number): Phaser.GameObjects.TileSprite => {
  const srcHeight = scene.textures.get(key).getSourceImage().height
  return scene.add.tileSprite(0, 0, scene.scale.width, scene.scale.height, key)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setScale(scene.scale.height / srcHeight)
    .setDepth(depth)
}

