import { copySvgAsImage, rasterizeSvg, saveBlob } from '~/_utils/svg-export';
import { embedInterFont } from '~/_utils/svg-fonts';
import { createZip } from '~/_utils/zip';

export const scales = [1, 2] as const;
export type Scale = (typeof scales)[number];

/** A filled-in template, ready to export. */
export type RenderedImage = {
  name: string;
  svg: string;
  width: number;
  height: number;
};

const scaled = (image: RenderedImage, scale: Scale) => ({
  width: image.width * scale,
  height: image.height * scale,
});

const renderPng = async (image: RenderedImage, scale: Scale) =>
  rasterizeSvg(await embedInterFont(image.svg), {
    ...scaled(image, scale),
    mime: 'image/png',
  });

export const downloadPng = async (image: RenderedImage, scale: Scale) =>
  saveBlob(await renderPng(image, scale), `${image.name}.png`);

export const copyPng = async (image: RenderedImage, scale: Scale) =>
  copySvgAsImage(await embedInterFont(image.svg), scaled(image, scale));

export const downloadZip = async (
  name: string,
  images: RenderedImage[],
  scale: Scale,
) => {
  const files = await Promise.all(
    images.map(async (image) => ({
      name: `${image.name}.png`,
      blob: await renderPng(image, scale),
    })),
  );
  saveBlob(await createZip(files), `${name}.zip`);
};
