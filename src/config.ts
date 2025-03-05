

export default {
  player: {
    hpStart: 100,
    hpMax: 100,
    hpRegen: 0,
    energyStart: 20,
    energyMax: 100,
    energyRegen: 1,
    energyDrainRate: 0.1,
    dashDistance: 500,
    dashSpeed: 30,
    dashCooldown: 500,
    teleportDistance: 250,
    teleportCooldown: 1000,
    velocity: 2,
    maxVelocity: 4,
    acceleration: 0.2,
    deceleration: 0.1,
  },
  asteroid: {
    small: {
      hp: 20,
      speed: 1,
      size: [2, 4],
    },
    large: {
      hp: 50,
      speed: 1,
      size: [4, 6],
    },
  },
  beam: {
    damage: 1,
    speed: 10,
  },
}
