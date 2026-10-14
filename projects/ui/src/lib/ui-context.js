import { createContext, useContext } from 'react'

/**
 * What the canvas is currently showing. JS-driven components (charts, animations) can read this
 * instead of guessing, e.g. to skip an animation when motion is reduced.
 */
export const UIContext = createContext({ style: 'base', theme: 'light', reducedMotion: false })

export const useUI = () => useContext(UIContext)

/** True when the workshop's motion switch is off or the OS asks for reduced motion. */
export function useReducedMotion() {
  const { reducedMotion } = useUI()
  const os = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return reducedMotion || os
}
