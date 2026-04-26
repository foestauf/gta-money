import { useState, useCallback, useMemo } from 'react';
import { phases } from '../data/guide';

const STORAGE_KEY = 'tracker:gta5:money';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveCompleted(completed: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

export function useGuideProgress() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(loadCompleted);
  const [tipsOpen, setTipsOpen] = useState(false);

  const toggleStep = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      saveCompleted(next);
      return next;
    });
  }, []);

  const togglePhase = useCallback((phaseIndex: number) => {
    const phase = phases[phaseIndex];
    setCompletedSteps(prev => {
      const next = new Set(prev);
      const allDone = phase.steps.every(s => next.has(s.id));
      for (const step of phase.steps) {
        if (allDone) {
          next.delete(step.id);
        } else {
          next.add(step.id);
        }
      }
      saveCompleted(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      const empty = new Set<string>();
      saveCompleted(empty);
      setCompletedSteps(empty);
    }
  }, []);

  const currentPhaseIndex = useMemo(() => {
    for (let i = 0; i < phases.length; i++) {
      const allDone = phases[i].steps.every(s => completedSteps.has(s.id));
      if (!allDone) return i;
    }
    return phases.length - 1;
  }, [completedSteps]);

  const phaseProgress = useMemo(() => {
    return phases.map(phase => {
      const done = phase.steps.filter(s => completedSteps.has(s.id)).length;
      return { done, total: phase.steps.length, complete: done === phase.steps.length };
    });
  }, [completedSteps]);

  const runningMoney = useMemo(() => {
    let total = 0;
    for (const phase of phases) {
      for (const step of phase.steps) {
        if (completedSteps.has(step.id) && step.money) {
          total += step.money;
        }
      }
    }
    return total;
  }, [completedSteps]);

  return {
    completedSteps,
    toggleStep,
    togglePhase,
    reset,
    currentPhaseIndex,
    phaseProgress,
    runningMoney,
    tipsOpen,
    setTipsOpen,
  };
}
