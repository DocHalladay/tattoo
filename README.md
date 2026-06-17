# The Sleeve Story

An interactive 3D tattoo planning tool for visualizing a phased forearm sleeve concept — **Presence through time**.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## What you can do

- Rotate, zoom, and pan a 3D left forearm model
- Step through 5 tattoo phases with smooth crossfades
- Compare against your original design boards in the Reference panel
- Toggle labels, shading, auto-rotate, and future sleeve preview
- Export a PNG screenshot of the current 3D view

## Tattoo source

Tattoos are composited from your design boards in `public/reference/`:
- `sleeve-wrap-board.png` — wrap-around rotation views
- `sleeve-story-board.png` — center forearm + phase progression

Tune crop regions in `src/textures/referenceCrops.ts` if you update the images.

## Customization — where to swap things

| What | File |
|------|------|
| Phase titles & meanings | `src/data/phases.ts` |
| Symbolism legend copy | `src/data/symbolism.ts` |
| "BE HERE." anchor text | `src/textures/tattooElements.ts` → `ANCHOR_PHRASE` |
| Compass initials (M, E, W, D) | `src/textures/tattooElements.ts` → `FAMILY_INITIALS` |
| Birth flowers (Sept/April/May) | `src/textures/tattooElements.ts` → `BIRTH_FLOWERS` and `drawAster` / `drawDaisy` / `drawLily` |
| Individual tattoo art (SVG/PNG) | Replace `draw*` functions in `src/textures/tattooElements.ts` with `ctx.drawImage()` |
| 3D arm model | `src/components/scene/ForearmModel.tsx` — swap procedural mesh for glTF |
| Label positions on arm | `src/components/scene/LabelMarkers.tsx` → `anchors` |
| Reference design boards | Replace images in `public/reference/` |
| Camera angles | `src/data/cameraPresets.ts` |

## Tattoo concept

**Theme:** Presence through time — stay present for family, ride life's waves, keep direction, gain perspective, trust the legacy.

**Style:** Black and grey fine-line realism on a left forearm, designed to expand into a full sleeve.

**Birth flowers:** September aster, April daisy, May lily of the valley.

## Build for production

```bash
npm run build
npm run preview
```
