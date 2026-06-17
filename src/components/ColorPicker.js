'use client';
import { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import styles from './ColorPicker.module.css';

// Common cloth/fabric color presets with name + hex
const PRESETS = [
  { name: 'White',       hex: '#FFFFFF' },
  { name: 'Off-White',   hex: '#F5F0E8' },
  { name: 'Cream',       hex: '#FFFDD0' },
  { name: 'Ivory',       hex: '#FFFFF0' },
  { name: 'Beige',       hex: '#F5F5DC' },
  { name: 'Gold',        hex: '#FFD700' },
  { name: 'Yellow',      hex: '#FFEB3B' },
  { name: 'Mustard',     hex: '#FFDB58' },
  { name: 'Orange',      hex: '#FF6B35' },
  { name: 'Coral',       hex: '#FF7F7F' },
  { name: 'Crimson',     hex: '#DC143C' },
  { name: 'Red',         hex: '#E53935' },
  { name: 'Maroon',      hex: '#800000' },
  { name: 'Rose',        hex: '#FF90B3' },
  { name: 'Pink',        hex: '#F48FB1' },
  { name: 'Hot Pink',    hex: '#FF69B4' },
  { name: 'Magenta',     hex: '#FF00FF' },
  { name: 'Mauve',       hex: '#E0B0C0' },
  { name: 'Purple',      hex: '#7B1FA2' },
  { name: 'Violet',      hex: '#9C27B0' },
  { name: 'Lavender',    hex: '#E6B0FF' },
  { name: 'Indigo',      hex: '#3F51B5' },
  { name: 'Royal Blue',  hex: '#4169E1' },
  { name: 'Blue',        hex: '#2196F3' },
  { name: 'Sky Blue',    hex: '#87CEEB' },
  { name: 'Teal',        hex: '#009688' },
  { name: 'Green',       hex: '#4CAF50' },
  { name: 'Dark Green',  hex: '#1B5E20' },
  { name: 'Olive',       hex: '#808000' },
  { name: 'Sage',        hex: '#B2C4A0' },
  { name: 'Mint',        hex: '#98FF98' },
  { name: 'Turquoise',   hex: '#40E0D0' },
  { name: 'Tan',         hex: '#D2B48C' },
  { name: 'Brown',       hex: '#795548' },
  { name: 'Chocolate',   hex: '#3E2723' },
  { name: 'Silver',      hex: '#C0C0C0' },
  { name: 'Grey',        hex: '#9E9E9E' },
  { name: 'Charcoal',    hex: '#36454F' },
  { name: 'Black',       hex: '#212121' },
];

/**
 * ColorPicker component
 * 
 * Props:
 *   value: string[] — array of color names (e.g. ["Red", "Gold"])
 *   onChange: (colors: string[]) => void
 */
export default function ColorPicker({ value = [], onChange }) {
  const [pickerHex, setPickerHex] = useState('#a0522d');
  const [customName, setCustomName] = useState('');
  const pickerRef = useRef(null);

  const colors = Array.isArray(value) ? value : [];

  const addColor = (name, hex) => {
    if (!name.trim()) return;
    const label = name.trim();
    // avoid duplicates (case-insensitive)
    if (colors.find(c => c.toLowerCase() === label.toLowerCase())) return;
    // Store as "Name|#hex" so the storefront can show the actual color swatch
    onChange([...colors, `${label}|${hex}`]);
    setCustomName('');
  };

  const removeColor = (idx) => {
    const next = [...colors];
    next.splice(idx, 1);
    onChange(next);
  };

  // Parse stored value: could be "Name|#hex" or just "Name"
  const parseColor = (val) => {
    if (val.includes('|')) {
      const [name, hex] = val.split('|');
      return { name, hex };
    }
    // Try to match against presets
    const preset = PRESETS.find(p => p.name.toLowerCase() === val.toLowerCase());
    return { name: val, hex: preset?.hex || '#888888' };
  };

  const handlePresetClick = (preset) => {
    addColor(preset.name, preset.hex);
  };

  const handleAddCustom = () => {
    const name = customName.trim() || 'Custom';
    addColor(name, pickerHex);
  };

  const isPresetActive = (preset) =>
    colors.some(c => parseColor(c).name.toLowerCase() === preset.name.toLowerCase());

  return (
    <div className={styles.wrapper}>
      {/* Selected colors as tags */}
      {colors.length > 0 && (
        <div className={styles.tags}>
          {colors.map((c, i) => {
            const { name, hex } = parseColor(c);
            return (
              <div key={i} className={styles.tag}>
                <span className={styles.tagSwatch} style={{ background: hex }} />
                {name}
                <button type="button" className={styles.tagRemove} onClick={() => removeColor(i)}>
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Preset swatches */}
      <div>
        <div className={styles.presetsLabel}>Quick Presets</div>
        <div className={styles.presets} style={{ marginTop: 6 }}>
          {PRESETS.map(p => (
            <div
              key={p.name}
              title={p.name}
              className={`${styles.preset} ${isPresetActive(p) ? styles.presetActive : ''}`}
              style={{ background: p.hex, borderColor: isPresetActive(p) ? '#a0522d' : 'rgba(0,0,0,0.1)' }}
              onClick={() => handlePresetClick(p)}
            />
          ))}
        </div>
      </div>

      {/* Custom color input row */}
      <div className={styles.inputRow}>
        <input
          ref={pickerRef}
          type="color"
          value={pickerHex}
          onChange={e => setPickerHex(e.target.value)}
          className={styles.colorPickerInput}
          title="Pick a custom color"
        />
        <input
          type="text"
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          placeholder={`Name this color (${pickerHex})`}
          className={styles.nameInput}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
        />
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAddCustom}
          disabled={!pickerHex}
        >
          <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Add
        </button>
      </div>
      <span className={styles.hint}>Click a swatch to add it, or pick a custom color and give it a name.</span>
    </div>
  );
}
