export default {
  player: {
    hpStart: 100,
    hpMax: 100,
    hpRegen: 0,
    energyStart: 25,
    energyMax: 100,
    energyRegen: 0.01,
    energyDrainRate: 0.1,
    staminaStart: 0,
    staminaRegen: 0.005,
    maxStaminaStart: 3,
    maxStaminaEnd: 6,
    maxStaminaScoreInterval: 1000,
    dashDistance: 250,
    dashSpeed: 30,
    dashCooldown: 500,
    dashStaminaCost: 1,
    teleportDistance: 250,
    teleportCooldown: 1000,
    velocity: 2,
    maxVelocity: 4,
    acceleration: 0.2,
    deceleration: 0.1,
    boundsPadding: {
      top: 10,
      bottom: 30,
      left: 20,
      right: 20
    },
    colorDash: 0x00aaff,
    colorDamage: 0xffaaaa,
  },
  asteroid: {
    baseSpawnRate: 4000,
    minSpeed: 2,
    maxSpeedMultiplier: 3,
    rotationSpeed: 0.5,
    small: {
      hp: 50,
      damage: 20,
      speed: 1,
      size: [2, 2.5],
      score: 10
    },
    large: {
      hp: 100,
      damage: 40,
      speed: 1,
      size: [4.5, 5],
      score: 25
    },
  },
  powerUp: {
    baseSpawnRate: 0.5,
    rotationSpeed: 0.5,
    hpSmall: 1,
    hpMedium: 5,
    hpLarge: 15,
    energySmall: 3,
    energyMedium: 20,
    energyLarge: 50,
  },
  beam: {
    damage: 1,
    speed: 10,
    maxScale: 40,
    scaleDuration: 500,
    minAngle: -Math.PI / 3,
    maxAngle: Math.PI / 3,
    scaleX: 3,
  },
  hiscores: {
    threshold: 1000,
  },
  blackHole: {
    basePullForce: 200,
    maxPullForce: 400,
    speed: 1,
    size: [0.5, 1],
    rotationSpeed: 0.5,
    baseSpawnRate: 60000,
  },
}
