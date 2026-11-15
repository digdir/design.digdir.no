/**
 * SVG mockups for the image generator, e.g. a laptop with a `[image]` shape
 * as its screen. Made and listed the same way as the templates in
 * `../templates/index.ts`.
 */
import { type ImageTemplate, raw, toSource } from '../templates';

export const mockupTemplates = {
  laptop: {
    name: 'Laptop',
    load: raw(() => import('./laptop.svg?raw')),
  },
} satisfies Record<string, ImageTemplate>;

export const mockupSource = toSource(mockupTemplates);
