import type { ArrayInputSpec } from '../core/algorithm';
import { mulberry32 } from '../core/rng';
import { sound } from '../core/sound';

import { ARRAY_PRESETS, arrayPreset, type ArrayPreset } from '../data/generators';
import { t } from '../i18n';
import { BarsScene } from '../scenes/bars';
import type { Stage } from '../scenes/stage';
import { ui } from '../ui/components';
import { h } from '../ui/dom';
import type { Editor, EditorHost } from './editor';

export function createArrayEditor(spec: ArrayInputSpec, initial: number[], host: EditorHost): Editor {
  let values = initial.slice();
  let stage: Stage | null = null;
  let drag: number | null = null;

  const size = h('input', { type: 'range', min: spec.minN, max: spec.maxN, value: values.length, 'aria-label': t('edit.size') });
  const sizeValue = h('span', { class: 'picker__value' }, String(values.length));
  const preset = h('select', { class: 'theme-select', 'aria-label': t('edit.preset') },
    ...ARRAY_PRESETS.map((p) => h('option', { value: p }, t(`preset.${p}` as never))));
  const text = h('input', { type: 'text', class: 'search values-input', value: values.join(', '), 'aria-label': t('edit.values'), inputmode: 'numeric' });
  const error = h('p', { class: 'edit-error', role: 'alert', hidden: true });

  const regenerate = () => {
    values = arrayPreset(preset.value as ArrayPreset, Number(size.value), spec, mulberry32((Math.random() * 2 ** 32) >>> 0));
    sync();
    host.rebuilt();
  };
  size.addEventListener('input', () => { sizeValue.textContent = size.value; regenerate(); });
  const generate = ui.button({ label: t('edit.generate'), icon: 'shuffle', onClick: () => { sound.play('ui-select'); regenerate(); } });
  const applyText = () => {
    const parsed = text.value.split(/[\s,;]+/).filter(Boolean).map(Number);
    const ok = parsed.length >= spec.minN && parsed.length <= spec.maxN && parsed.every((v) => Number.isInteger(v) && v >= spec.min && v <= spec.max);
    error.hidden = ok;
    error.textContent = ok ? '' : t('edit.invalid', { min: spec.minN, max: spec.maxN, lo: spec.min, hi: spec.max });
    if (!ok) { sound.play('error'); return; }
    values = parsed;
    sync();
    host.rebuilt();
  };
  text.addEventListener('change', applyText);
  text.addEventListener('keydown', (e) => e.key === 'Enter' && applyText());

  const tools = h('div', { class: 'edit-tools' },
    h('label', { class: 'picker' }, h('span', { class: 'picker__label' }, t('edit.size')), h('span', { class: 'picker__row' }, size, sizeValue)),
    h('label', { class: 'picker' }, h('span', { class: 'picker__label' }, t('edit.preset')), preset),
    generate,
    h('label', { class: 'picker picker--grow' }, h('span', { class: 'picker__label' }, t('edit.values')), text),
    error,
    h('p', { class: 'edit-hint' }, t('edit.hintArray')),
  );

  function sync(): void {
    text.value = values.join(', ');
    size.value = String(values.length);
    sizeValue.textContent = String(values.length);
    error.hidden = true;
  }

  const scene = () => stage?.currentScene as BarsScene | undefined;
  const onDown = (e: PointerEvent) => {
    const p = stage!.toLogical(e.clientX, e.clientY);
    const i = scene()?.indexAt(p.x) ?? null;
    if (i === null) return;
    drag = i;
    stage!.canvas.setPointerCapture(e.pointerId);
    onMove(e);
  };
  const onMove = (e: PointerEvent) => {
    if (drag === null) return;
    const v = scene()?.valueAt(stage!.toLogical(e.clientX, e.clientY).y);
    if (v === null || v === undefined) return;
    const clamped = Math.max(spec.min, Math.min(spec.max, v));
    if (clamped === values[drag]) return;
    values[drag] = clamped;
    sound.play('compare', (clamped - spec.min) / Math.max(1, spec.max - spec.min));
    sync();
    host.changed();
  };
  const onUp = () => { drag = null; };

  return {
    tools,
    value: () => values.slice(),
    decorate: (step) => step,
    attach(s) {
      stage = s;
      s.canvas.addEventListener('pointerdown', onDown);
      s.canvas.addEventListener('pointermove', onMove);
      s.canvas.addEventListener('pointerup', onUp);
      s.canvas.classList.add('is-editable');
    },
    detach() {
      stage?.canvas.removeEventListener('pointerdown', onDown);
      stage?.canvas.removeEventListener('pointermove', onMove);
      stage?.canvas.removeEventListener('pointerup', onUp);
      stage?.canvas.classList.remove('is-editable');
      stage = null;
    },
  };
}

