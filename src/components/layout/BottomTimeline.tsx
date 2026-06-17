import { phases, getPhaseForValue } from '../../data/phases';
import { useApp } from '../../store/AppContext';

export function BottomTimeline() {
  const { phase, setPhase } = useApp();
  const current = getPhaseForValue(phase);

  return (
    <footer className="timeline">
      <div className="timeline-labels">
        {phases.map((p) => (
          <span
            key={p.id}
            style={{ cursor: 'pointer', color: Math.round(phase) === p.id ? '#c5a059' : undefined }}
            onClick={() => setPhase(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setPhase(p.id)}
          >
            Phase {p.id}
          </span>
        ))}
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={0.01}
        value={phase}
        onChange={(e) => setPhase(parseFloat(e.target.value))}
        aria-label="Tattoo phase timeline"
      />
      <div className="timeline-phase-name">
        {current.title} — {current.subtitle}
      </div>
    </footer>
  );
}
