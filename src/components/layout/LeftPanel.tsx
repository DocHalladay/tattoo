import { phases } from '../../data/phases';
import { useApp } from '../../store/AppContext';

export function LeftPanel() {
  const { phase, setPhase } = useApp();
  const activePhase = Math.round(phase);

  return (
    <aside className="panel panel-left">
      <h2 className="panel-title">Phases</h2>
      {phases.map((p) => (
        <div
          key={p.id}
          className={`phase-card ${activePhase === p.id ? 'active' : ''}`}
          onClick={() => setPhase(p.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setPhase(p.id)}
        >
          <div className="phase-num">Phase {p.id}</div>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <p className="meaning">{p.meaning}</p>
        </div>
      ))}
    </aside>
  );
}
