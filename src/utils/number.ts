import { clamp } from 'nyx-kit/utils'

export const clampIncrease = (current: number, increase: number, max: number) => {
  const newValue = current + increase
  return clamp(newValue, 0, max)
}

export const clampDecrease = (current: number, decrease: number, min: number) => {
  const newValue = current - decrease
  return clamp(newValue, min, 0)
}
