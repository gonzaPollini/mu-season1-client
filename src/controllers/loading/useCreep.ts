import { useEffect, useState } from 'react';
import { creepTarget, creepTransition } from './creep';

/** Long enough for the first paint to land. */
const ARM_MS = 50;

/**
 * Ours: `creepTarget` / `creepTransition` for a bar that just mounted. The first paint shows the real
 * value with no transition (a fresh element has nothing to animate from); `ARM_MS` later the bar
 * starts creeping, so it is moving from the very start of a load.
 */
export function useCreep(progress: number): { shown: number; transition: string } {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    // A timer rather than animation frames: those stop while the window is covered.
    const timer = setTimeout(() => setArmed(true), ARM_MS);
    return () => clearTimeout(timer);
  }, []);
  if (!armed) return { shown: Math.max(0, Math.min(1, progress || 0)), transition: 'none' };
  return { shown: creepTarget(progress), transition: creepTransition(progress) };
}
