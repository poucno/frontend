import { createContext, useContext } from 'react'

export type MotionState = {
  /** False when the visitor prefers reduced motion or paused the animations. */
  motionEnabled: boolean
  paused: boolean
  reducedMotion: boolean
  togglePaused: () => void
}

export const MotionContext = createContext<MotionState>({
  motionEnabled: true,
  paused: false,
  reducedMotion: false,
  togglePaused: () => {},
})

export function useMotion() {
  return useContext(MotionContext)
}
