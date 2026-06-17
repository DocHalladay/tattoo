import { cameraPresets } from '../../data/cameraPresets';
import { useApp } from '../../store/AppContext';

export function Toolbar() {
  const {
    showLabels,
    setShowLabels,
    showReference,
    setShowReference,
    shadingMode,
    setShadingMode,
    autoRotate,
    setAutoRotate,
    setCameraPreset,
    cameraPreset,
  } = useApp();

  return (
    <>
      <div className="camera-presets">
        {cameraPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={cameraPreset === preset.id ? 'active' : ''}
            onClick={() => {
              setCameraPreset(preset.id);
              if (preset.autoRotate) setAutoRotate(true);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="toolbar">
        <button
          type="button"
          className={showLabels ? 'active' : ''}
          onClick={() => setShowLabels(!showLabels)}
        >
          {showLabels ? 'Hide' : 'Show'} Labels
        </button>
        <button
          type="button"
          className={showReference ? 'active' : ''}
          onClick={() => setShowReference(!showReference)}
        >
          {showReference ? 'Hide' : 'Show'} Reference
        </button>
        <button
          type="button"
          className={shadingMode === 'light' ? 'active' : ''}
          onClick={() => setShadingMode('light')}
        >
          Light Ink
        </button>
        <button
          type="button"
          className={shadingMode === 'heavy' ? 'active' : ''}
          onClick={() => setShadingMode('heavy')}
        >
          Heavy Ink
        </button>
        <button
          type="button"
          className={autoRotate ? 'active' : ''}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          Auto-Rotate {autoRotate ? 'On' : 'Off'}
        </button>
      </div>
    </>
  );
}
