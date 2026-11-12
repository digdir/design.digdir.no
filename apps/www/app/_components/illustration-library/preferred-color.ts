import {
  colorFamily,
  type IllustrationLibrary,
  slotColorInFamily,
  type VectorIllustrationMeta,
} from '@digdir/digdir-design/illustrations';
import type { CSSProperties } from 'react';

/**
 * Slot values for showing `item` in the user's preferred colour: every slot
 * that allows the colour gets it, the rest keep their drawn colour. A grouped
 * slot follows its group: it takes its own colour in the preferred colour's
 * family. Keyed by the slot's CSS variable, like the dialog's own slot state.
 */
export const preferredSlotValues = (
  item: VectorIllustrationMeta,
  color: string | null,
): Record<string, string> =>
  Object.fromEntries(
    item.slots.map((slot) => {
      const preferred =
        color && slot.group
          ? slotColorInFamily(slot, colorFamily(color))
          : color && slot.colors.includes(color)
            ? color
            : undefined;
      return [slot.variable, preferred ?? slot.default];
    }),
  );

/**
 * Inline style that applies slot values to an inlined SVG string: each slot
 * variable is pointed at the palette variable, so dark mode keeps working.
 * Slots left at their drawn colour are omitted (the SVG's fallback shows).
 */
export const slotStyle = (
  library: IllustrationLibrary,
  item: VectorIllustrationMeta,
  values: Record<string, string>,
): CSSProperties | undefined => {
  const style: Record<string, string> = {};
  for (const slot of item.slots) {
    const value = values[slot.variable];
    const color = library.colors.find((candidate) => candidate.name === value);
    if (color && value !== slot.default) {
      style[slot.variable] = `var(${color.variable})`;
    }
  }
  return Object.keys(style).length > 0 ? style : undefined;
};

/** Colours offered in the gallery filter. Tints and neutrals are left out. */
const FILTER_COLORS = ['red', 'yellow', 'blue'];

/** Filter colours that at least one slot in the library can take. */
export const selectableColors = (library: IllustrationLibrary) => {
  const used = new Set(
    library.illustrations.flatMap((item) =>
      item.format === 'svg'
        ? [
            ...item.slots.flatMap((slot) => slot.colors),
            ...item.groups.flatMap((group) => group.colors),
          ]
        : [],
    ),
  );
  return library.colors.filter(
    (color) => FILTER_COLORS.includes(color.name) && used.has(color.name),
  );
};
