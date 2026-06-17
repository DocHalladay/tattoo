import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { CameraPresetId } from '../data/cameraPresets';

export type ShadingMode = 'light' | 'heavy';

interface AppState {
  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
  showReference: boolean;
  setShowReference: (v: boolean) => void;
  shadingMode: ShadingMode;
  setShadingMode: (m: ShadingMode) => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean) => void;
  cameraPreset: CameraPresetId | null;
  setCameraPreset: (id: CameraPresetId | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  exportScreenshot: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [showLabels, setShowLabels] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [shadingMode, setShadingMode] = useState<ShadingMode>('light');
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const exportScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'sleeve-story.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <AppContext.Provider
      value={{
        showLabels,
        setShowLabels,
        showReference,
        setShowReference,
        shadingMode,
        setShadingMode,
        autoRotate,
        setAutoRotate,
        cameraPreset,
        setCameraPreset,
        canvasRef,
        exportScreenshot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
