import { createContext, useContext } from 'react'

export type MotionState = {
  /** False when the visitor prefers reduced motion. */
  motionEnabled: boolean
}

export const MotionContext = createContext<MotionState>({
  motionEnabled: true,
})

export function useMotion() {
  return useContext(MotionContext)
}
