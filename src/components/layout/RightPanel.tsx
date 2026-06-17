import { symbolism } from '../../data/symbolism';

export function RightPanel() {
  return (
    <aside className="panel panel-right">
      <h2 className="panel-title">Symbolism</h2>
      {symbolism.map((entry) => (
        <div key={entry.id} className="legend-item">
          <h4>{entry.title}</h4>
          <p>{entry.meaning}</p>
        </div>
      ))}
    </aside>
  );
}
