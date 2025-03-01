export const createBackgroundLooped = (scene: Phaser.Scene, key: string, num: number, scrollFactor: number) => {
  for (let i = 0; i < num; i++) {
    scene.add.image(0, 0, key).setOrigin(0, 0).setScrollFactor(scrollFactor)
  }
}

