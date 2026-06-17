import { AppProvider, useApp } from './store/AppContext';
import { ReferencePanel } from './components/layout/ReferencePanel';
import { Toolbar } from './components/layout/Toolbar';
import { ArmScene } from './components/scene/ArmScene';

function AppContent() {
  const { showReference, exportScreenshot } = useApp();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <h1>The Sleeve Story</h1>
          <span className="subtitle">Presence through time</span>
        </div>
        <button type="button" className="export-btn" onClick={exportScreenshot}>
          Export Screenshot
        </button>
      </header>

      <main className="app-main">
        <div className="center-column">
          <div className="center-row">
            <div className="canvas-wrap">
              <ArmScene />
            </div>
            {showReference && <ReferencePanel />}
          </div>
          <Toolbar />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
