import { useState, lazy, Suspense } from 'react';
import '../../App.css';
import { phases, tips, type Step, type MapIcon } from '../../data/guide';
import { useGuideProgress } from '../../hooks/useGuideProgress';

const MapView = lazy(() => import('../../components/MapView'));

function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  return `$${amount.toLocaleString()}`;
}

function MapIconBadge({ icon }: { icon: MapIcon }) {
  if (icon === 'none') return null;
  const cls =
    icon === '?' ? 'icon-Q' : icon === '$' ? 'icon-dollar' : `icon-${icon}`;
  return <span className={`map-icon ${cls}`}>{icon}</span>;
}

function StepItem({
  step,
  done,
  onToggle,
}: {
  step: Step;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`step-item ${done ? 'done' : ''}`}>
      <div className={`char-stripe ${step.character}`} />
      <input
        type="checkbox"
        className="step-checkbox"
        checked={done}
        onChange={onToggle}
        aria-label={step.title}
      />
      <div className="step-content">
        <div className="step-title-row">
          <MapIconBadge icon={step.mapIcon} />
          <span className="step-title">{step.title}</span>
          {step.money != null && step.money !== 0 && (
            <span className={`step-money ${step.money < 0 ? 'negative' : ''}`}>
              {step.money > 0 ? '+' : ''}
              {formatMoney(step.money)}
            </span>
          )}
        </div>
        {step.description && <div className="step-desc">{step.description}</div>}
        {step.investment && (
          <div className="investment-info">
            <span>
              <span className="investment-label">Stock:</span>{' '}
              {step.investment.stock}
            </span>
            <span>
              <span className="investment-label">Exchange:</span>{' '}
              {step.investment.exchange}
            </span>
            {step.investment.expectedReturn && (
              <span>
                <span className="investment-label">Return:</span>{' '}
                {step.investment.expectedReturn}
              </span>
            )}
          </div>
        )}
        {step.heist && (
          <div className="heist-info">
            <div className="heist-row">
              <span className="heist-label">Approach:</span>
              <span>{step.heist.approach}</span>
            </div>
            <div className="heist-row">
              <span className="heist-label">Crew:</span>
              <span>{step.heist.crew.join(', ')}</span>
            </div>
            <div className="heist-row">
              <span className="heist-label">Payout:</span>
              <span>{step.heist.payout}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseCard({
  phaseIndex,
  currentPhaseIndex,
  completedSteps,
  phaseProgress,
  toggleStep,
  togglePhase,
}: {
  phaseIndex: number;
  currentPhaseIndex: number;
  completedSteps: Set<string>;
  phaseProgress: { done: number; total: number; complete: boolean };
  toggleStep: (id: string) => void;
  togglePhase: (phaseIndex: number) => void;
}) {
  const phase = phases[phaseIndex];
  const isComplete = phaseProgress.complete;
  const isCurrent = phaseIndex === currentPhaseIndex;
  const isLocked = phaseIndex > currentPhaseIndex + 1;

  const [expanded, setExpanded] = useState(isCurrent);

  const status = isComplete ? 'completed' : isLocked ? 'locked' : '';

  return (
    <div className={`phase-card ${status}`}>
      <div className="phase-header" onClick={() => !isLocked && setExpanded(!expanded)}>
        <div className="phase-header-left">
          {!isLocked && (
            <input
              type="checkbox"
              className="phase-checkbox"
              checked={isComplete}
              onChange={(e) => {
                e.stopPropagation();
                togglePhase(phaseIndex);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Complete all steps in ${phase.title}`}
            />
          )}
          <div>
            <div className="phase-gate">
              {phase.gateType === 'before' ? 'Before' : 'After'}: {phase.gate}
            </div>
            <h3 className="phase-title">{phase.title}</h3>
          </div>
        </div>
        <div className="phase-progress">
          <span>
            {phaseProgress.done}/{phaseProgress.total}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(phaseProgress.done / phaseProgress.total) * 100}%`,
              }}
            />
          </div>
          <span>{expanded && !isLocked ? '\u25B2' : '\u25BC'}</span>
        </div>
      </div>
      {expanded && !isLocked && (
        <div className="phase-steps">
          {phase.steps.map(step => (
            <StepItem
              key={step.id}
              step={step}
              done={completedSteps.has(step.id)}
              onToggle={() => toggleStep(step.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Gta5Page() {
  const {
    completedSteps,
    toggleStep,
    togglePhase,
    reset,
    currentPhaseIndex,
    phaseProgress,
    runningMoney,
    tipsOpen,
    setTipsOpen,
  } = useGuideProgress();

  const [mapOpen, setMapOpen] = useState(false);

  const allDone = phaseProgress.every(p => p.complete);

  return (
    <>
      <header className="header">
        <h1>GTA V Money Guide</h1>
        <p className="subtitle">
          Story Mode Money Maximisation Tracker &mdash; Target: ~$20.8B
        </p>
        <div className="money-totals">
          <span className="money-total combined">
            Collected: {formatMoney(runningMoney)}
          </span>
        </div>
        <div className="header-buttons">
          <button className="map-toggle-btn" onClick={() => setMapOpen(!mapOpen)}>
            {mapOpen ? 'Hide Map' : 'Show Map'}
          </button>
          <button className="reset-btn" onClick={reset}>
            Reset Progress
          </button>
        </div>
      </header>

      {mapOpen && (
        <Suspense fallback={<div className="map-loading">Loading map...</div>}>
          <MapView
            completedSteps={completedSteps}
            toggleStep={toggleStep}
            onClose={() => setMapOpen(false)}
          />
        </Suspense>
      )}

      <div className="tips-bar">
        <button className="tips-toggle" onClick={() => setTipsOpen(!tipsOpen)}>
          <span>General Tips</span>
          <span className={`arrow ${tipsOpen ? 'open' : ''}`}>{'\u25BC'}</span>
        </button>
        {tipsOpen && (
          <ul className="tips-list">
            {tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )}
      </div>

      {phases.map((_, i) => (
        <PhaseCard
          key={phases[i].id}
          phaseIndex={i}
          currentPhaseIndex={currentPhaseIndex}
          completedSteps={completedSteps}
          phaseProgress={phaseProgress[i]}
          toggleStep={toggleStep}
          togglePhase={togglePhase}
        />
      ))}

      {allDone && (
        <div className="all-done">
          <h2>You've Done It!</h2>
          <p>
            All steps complete. You should be sitting on roughly $20.8 billion
            across all three characters. Not bad for a day's work.
          </p>
        </div>
      )}
    </>
  );
}

export default Gta5Page;
