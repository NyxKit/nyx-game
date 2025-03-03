import { clamp } from 'nyx-kit/utils'

export const clampIncrease = (current: number, increase: number, min: number, max: number) => {
  const newValue = current + increase
  return clamp(newValue, min, max)
}

export const clampDecrease = (current: number, decrease: number, min: number, max: number) => {
  const newValue = current - decrease
  return clamp(newValue, min, max)
}
