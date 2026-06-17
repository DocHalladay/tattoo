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
  phase: number;
  setPhase: (phase: number) => void;
  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
  showReference: boolean;
  setShowReference: (v: boolean) => void;
  showFuturePreview: boolean;
  setShowFuturePreview: (v: boolean) => void;
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
  const [phase, setPhase] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showReference, setShowReference] = useState(true);
  const [showFuturePreview, setShowFuturePreview] = useState(true);
  const [shadingMode, setShadingMode] = useState<ShadingMode>('light');
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const exportScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `sleeve-story-phase-${Math.round(phase)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [phase]);

  return (
    <AppContext.Provider
      value={{
        phase,
        setPhase,
        showLabels,
        setShowLabels,
        showReference,
        setShowReference,
        showFuturePreview,
        setShowFuturePreview,
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
