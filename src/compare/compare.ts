import { readFileSync, writeFileSync } from 'fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { resizeImage } from './utils';

export const compareImages = async (
  baselineShotPath: string,
  currentShotPath: string,
  differenceShotPath?: string,
): Promise<number> => {
  const baselineImageBuffer = readFileSync(baselineShotPath);
  const currentImageBuffer = readFileSync(currentShotPath);

  if (baselineImageBuffer.equals(currentImageBuffer)) {
    return 0;
  }

  let baselineImage: PNG = PNG.sync.read(baselineImageBuffer);
  let currentImage: PNG = PNG.sync.read(currentImageBuffer);

  const maxWidth = Math.max(
    baselineImage.width || 100,
    currentImage.width || 100,
  );
  const maxHeight = Math.max(
    baselineImage.height || 100,
    currentImage.height || 100,
  );

  if (
    baselineImage.width !== currentImage.width ||
    baselineImage.height !== currentImage.height
  ) {
    baselineImage = resizeImage(baselineImage, maxWidth, maxHeight);
    currentImage = resizeImage(currentImage, maxWidth, maxHeight);
  }
  const differenceImage = new PNG({ width: maxWidth, height: maxHeight });

  const pixelDifference = pixelmatch(
    baselineImage.data,
    currentImage.data,
    differenceImage.data,
    maxWidth,
    maxHeight,
    { threshold: 0 },
  );

  if (pixelDifference > 0 && differenceShotPath) {
    writeFileSync(differenceShotPath, PNG.sync.write(differenceImage));
  }

  return pixelDifference;
};