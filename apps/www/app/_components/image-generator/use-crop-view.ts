import { useState } from 'react';
import type { Rect } from './svg-template';

export const MAX_ZOOM = 5;

type Size = { width: number; height: number };
type View = { zoom: number; x: number; y: number };

/**
 * Which part of an image to show in a shape of the given aspect ratio. The
 * largest part with that ratio is zoom 1; zooming in shows a smaller part.
 * `x`/`y` is its centre, in image pixels, and is kept inside the image.
 */
export const useCropView = (image: Size, aspect: number, crop?: Rect) => {
  const base =
    image.width / image.height > aspect
      ? { width: image.height * aspect, height: image.height }
      : { width: image.width, height: image.width / aspect };

  const clamp = ({ zoom, x, y }: View): View => {
    const z = Math.min(Math.max(zoom, 1), MAX_ZOOM);
    const halfWidth = base.width / z / 2;
    const halfHeight = base.height / z / 2;
    return {
      zoom: z,
      x: Math.min(Math.max(x, halfWidth), image.width - halfWidth),
      y: Math.min(Math.max(y, halfHeight), image.height - halfHeight),
    };
  };

  const centred: View = { zoom: 1, x: image.width / 2, y: image.height / 2 };
  const [view, setView] = useState(() =>
    crop
      ? clamp({
          zoom: base.width / crop.width,
          x: crop.x + crop.width / 2,
          y: crop.y + crop.height / 2,
        })
      : centred,
  );
  const update = (change: (current: View) => View) =>
    setView((current) => clamp(change(current)));

  const width = base.width / view.zoom;
  const height = base.height / view.zoom;

  return {
    zoom: view.zoom,
    /** The part of the image shown, in image pixels. */
    visible: {
      x: view.x - width / 2,
      y: view.y - height / 2,
      width,
      height,
    } satisfies Rect,
    /** Move the visible part by `dx`/`dy` image pixels. */
    pan: (dx: number, dy: number) =>
      update((current) => ({
        ...current,
        x: current.x + dx,
        y: current.y + dy,
      })),
    zoomBy: (factor: number) =>
      update((current) => ({ ...current, zoom: current.zoom * factor })),
    setZoom: (zoom: number) => update((current) => ({ ...current, zoom })),
    reset: () => setView(centred),
  };
};
