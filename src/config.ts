

export default {
  player: {
    hpStart: 100,
    hpMax: 100,
    hpRegen: 0,
    energyStart: 20,
    energyMax: 100,
    energyRegen: 1,
    energyDrainRate: 0.1,
    dashDistance: 250,
    dashSpeed: 30,
    dashCooldown: 500,
    teleportDistance: 250,
    teleportCooldown: 1000,
    velocity: 2,
    maxVelocity: 4,
    acceleration: 0.2,
    deceleration: 0.1,
    boundsPadding: 50,
    colorDash: 0x00aaff,
    colorDamage: 0xffaaaa,
  },
  asteroid: {
    minSpeed: 2,
    maxSpeedMultiplier: 3,
    small: {
      hp: 20,
      speed: 1,
      size: [2, 3],
    },
    large: {
      hp: 50,
      speed: 1,
      size: [4, 5],
    },
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
}
