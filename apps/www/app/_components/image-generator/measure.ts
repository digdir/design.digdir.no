import { type RefObject, useLayoutEffect, useState } from 'react';
import type { ParsedTemplate, Rect } from './svg-template';

/** An `[image]` shape: its bounding box and its outline as SVG markup. */
export type ImageShape = { box: Rect; outline: string };

export type Measurements = {
  /** Width of each text field's first line, by field index. */
  widths: (number | undefined)[];
  /** Each image field's shape, by field index. */
  shapes: (ImageShape | undefined)[];
};

const OUTLINE_IGNORED = [
  'id',
  'class',
  'style',
  'fill',
  'stroke',
  'stroke-width',
  'transform',
  'data-name',
  'data-field',
];

/**
 * Bounding box of an `[image]` shape in its own coordinates (what the image
 * pattern covers), plus its outline for the crop dialog.
 */
const measureShape = (shape: SVGGraphicsElement): ImageShape => {
  const { x, y, width, height } = shape.getBBox();
  const outline = shape.cloneNode() as SVGGraphicsElement;
  for (const name of OUTLINE_IGNORED) outline.removeAttribute(name);
  return { box: { x, y, width, height }, outline: outline.outerHTML };
};

/**
 * Measures `parsed.measure` – the template as exported – once it is rendered
 * into `ref`, so `[center]`/`[right]` fields anchor where the designer placed
 * them and images can be cropped to their shapes. `null` until measured.
 */
export const useMeasurements = (
  ref: RefObject<HTMLElement | null>,
  parsed: ParsedTemplate,
) => {
  const [measurements, setMeasurements] = useState<Measurements | null>(null);

  useLayoutEffect(() => {
    const widths: (number | undefined)[] = [];
    const shapes: (ImageShape | undefined)[] = [];
    for (const element of ref.current?.querySelectorAll<SVGGraphicsElement>(
      '[data-field]',
    ) ?? []) {
      const index = Number(element.dataset.field);
      if (!(element instanceof SVGTextElement)) {
        shapes[index] = measureShape(element);
        continue;
      }
      // Trailing spaces don't count, as `render` drops them from aligned text.
      const firstLine = parsed.fields[index]?.defaultValue
        .split('\n')[0]
        .trimEnd();
      if (!firstLine) continue;
      widths[index] =
        element.getEndPositionOfChar(firstLine.length - 1).x -
        element.getStartPositionOfChar(0).x;
    }
    setMeasurements({ widths, shapes });
  }, [ref, parsed]);

  return measurements;
};
