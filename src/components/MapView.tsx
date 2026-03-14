import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { phases, type Step, type Character } from '../data/guide';
import { stepCoordinates, gameToLatLng } from '../data/coordinates';
import { collectibleGroups } from '../data/collectibleLocations';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: undefined,
  iconUrl: undefined,
  shadowUrl: undefined,
});

// GTA V map bounds (approximate)
const MAP_BOUNDS: L.LatLngBoundsExpression = [
  [0, 0],
  [350, 250],
];

const MAP_CENTER: L.LatLngExpression = [173, 117];

function createMarkerIcon(character: Character, done: boolean, collectible?: boolean): L.DivIcon {
  const classes = [
    'gta-marker',
    collectible ? 'collectible' : character,
    done ? 'done' : '',
  ].filter(Boolean).join(' ');

  const label = collectible ? '' : character[0].toUpperCase();

  return L.divIcon({
    className: '',
    html: `<div class="${classes}">${label}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function createCollectibleIcon(emoji: string, done: boolean): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="gta-marker collectible ${done ? 'done' : ''}">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  return `$${amount.toLocaleString()}`;
}

interface StepMarker {
  step: Step;
  phaseId: string;
  phaseIndex: number;
  position: [number, number];
  label: string;
}

interface MapViewProps {
  completedSteps: Set<string>;
  toggleStep: (id: string) => void;
  onClose: () => void;
}

export default function MapView({ completedSteps, toggleStep, onClose }: MapViewProps) {
  const [charFilters, setCharFilters] = useState<Record<Character, boolean>>({
    michael: true,
    franklin: true,
    trevor: true,
    any: true,
  });
  const [hideDone, setHideDone] = useState(false);
  const [showCollectibles, setShowCollectibles] = useState(false);

  // Build step markers
  const stepMarkers = useMemo<StepMarker[]>(() => {
    const markers: StepMarker[] = [];
    phases.forEach((phase, phaseIndex) => {
      for (const step of phase.steps) {
        const coords = stepCoordinates[step.id];
        if (!coords) continue;
        for (const coord of coords) {
          markers.push({
            step,
            phaseId: phase.id,
            phaseIndex,
            position: gameToLatLng(coord),
            label: coord.label || step.title,
          });
        }
      }
    });
    return markers;
  }, []);

  // Filter markers
  const filteredMarkers = useMemo(() => {
    return stepMarkers.filter(m => {
      if (!charFilters[m.step.character]) return false;
      if (hideDone && completedSteps.has(m.step.id)) return false;
      return true;
    });
  }, [stepMarkers, charFilters, hideDone, completedSteps]);

  // Collectible markers
  const filteredCollectibles = useMemo(() => {
    if (!showCollectibles) return [];
    return collectibleGroups.flatMap(group =>
      group.locations.map(loc => ({
        ...loc,
        position: gameToLatLng(loc),
        group,
        done: completedSteps.has(group.stepId),
      }))
    ).filter(c => !(hideDone && c.done));
  }, [showCollectibles, hideDone, completedSteps]);

  const toggleChar = (c: Character) => {
    setCharFilters(prev => ({ ...prev, [c]: !prev[c] }));
  };

  return (
    <div className="map-panel">
      <div className="map-header">
        <h3 className="map-title">GTA V Map</h3>
        <button className="map-close-btn" onClick={onClose}>Close</button>
      </div>

      <MapContainer
        className="map-container"
        center={MAP_CENTER}
        zoom={3}
        minZoom={2}
        maxZoom={7}
        maxBounds={MAP_BOUNDS}
        maxBoundsViscosity={0.8}
        crs={L.CRS.Simple}
        attributionControl={false}
      >
        <TileLayer
          url="https://gta5-map.github.io/tiles/road/{z}-{x}_{y}.png"
          minZoom={2}
          maxZoom={7}
          noWrap={true}
          tileSize={256}
        />

        {filteredMarkers.map((m, i) => (
          <Marker
            key={`${m.step.id}-${i}`}
            position={m.position}
            icon={createMarkerIcon(m.step.character, completedSteps.has(m.step.id))}
          >
            <Popup className="gta-popup">
              <div className="popup-title">{m.label}</div>
              {m.step.description && (
                <div className="popup-desc">{m.step.description}</div>
              )}
              {m.step.money != null && m.step.money !== 0 && (
                <div className={`popup-money ${m.step.money < 0 ? 'negative' : ''}`}>
                  {m.step.money > 0 ? '+' : ''}{formatMoney(m.step.money)}
                </div>
              )}
              <label className="popup-check">
                <input
                  type="checkbox"
                  checked={completedSteps.has(m.step.id)}
                  onChange={() => toggleStep(m.step.id)}
                />
                {completedSteps.has(m.step.id) ? 'Completed' : 'Mark complete'}
              </label>
            </Popup>
          </Marker>
        ))}

        {filteredCollectibles.map((c, i) => (
          <Marker
            key={`col-${c.group.stepId}-${i}`}
            position={c.position}
            icon={createCollectibleIcon(c.group.icon, c.done)}
          >
            <Popup className="gta-popup">
              <div className="popup-title">{c.label}</div>
              <div className="popup-desc">{c.group.name}</div>
              <label className="popup-check">
                <input
                  type="checkbox"
                  checked={c.done}
                  onChange={() => toggleStep(c.group.stepId)}
                />
                {c.done ? 'All collected' : 'Mark all collected'}
              </label>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-filters">
        {(['michael', 'franklin', 'trevor', 'any'] as Character[]).map(c => (
          <button
            key={c}
            className={`map-filter-btn ${charFilters[c] ? `active ${c}` : ''}`}
            onClick={() => toggleChar(c)}
          >
            {c === 'any' ? 'Any' : c[0].toUpperCase() + c.slice(1)}
          </button>
        ))}
        <span className="map-filter-sep" />
        <button
          className={`map-filter-btn ${hideDone ? 'active hide-done' : ''}`}
          onClick={() => setHideDone(!hideDone)}
        >
          Hide Done
        </button>
        <button
          className={`map-filter-btn ${showCollectibles ? 'active collectibles' : ''}`}
          onClick={() => setShowCollectibles(!showCollectibles)}
        >
          Collectibles
        </button>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--michael)' }} />
          Michael
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--franklin)' }} />
          Franklin
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--trevor)' }} />
          Trevor
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#8b949e' }} />
          Any
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#39ff14' }} />
          Collectible
        </div>
      </div>
    </div>
  );
}
