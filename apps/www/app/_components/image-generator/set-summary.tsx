import { Button, Card, Heading, Paragraph } from '@digdir/designsystemet-react';
import { DownloadIcon, FilesIcon, PencilIcon } from '@navikt/aksel-icons';
import { useState } from 'react';
import {
  copyPng,
  downloadPng,
  downloadZip,
  type RenderedImage,
  type Scale,
} from './export';
import { SizeSelect, StatusMessage, useExportStatus } from './export-controls';
import exportClasses from './export-controls.module.css';
import { Preview } from './preview';
import classes from './set-summary.module.css';

interface SetSummaryProps {
  name: string;
  labels: string[];
  images: RenderedImage[];
  onEdit: (step: number) => void;
}

/** Last step of a set: every image, each with its own actions, and a zip. */
export const SetSummary = ({
  name,
  labels,
  images,
  onEdit,
}: SetSummaryProps) => {
  const [scale, setScale] = useState<Scale>(1);
  const [zipping, setZipping] = useState(false);
  const { status, run } = useExportStatus();

  const downloadAll = async () => {
    setZipping(true);
    await run(() => downloadZip(name, images, scale));
    setZipping(false);
  };

  return (
    <div className={classes.summary} data-color='neutral'>
      <Paragraph>
        Last ned alle bildene samlet, eller hvert bilde for seg. Du kan gå
        tilbake og endre et bilde uten å miste det du har skrevet.
      </Paragraph>
      <div className={exportClasses.actions} data-color='accent'>
        <SizeSelect images={images} value={scale} onChange={setScale} />
        <Button type='button' loading={zipping} onClick={downloadAll}>
          {!zipping && <DownloadIcon aria-hidden />}
          Last ned alle ({images.length}) som zip
        </Button>
      </div>
      <StatusMessage status={status} />

      <ul className={classes.cards}>
        {images.map((image, index) => (
          <Card asChild key={image.name} className={classes.card}>
            <li>
              <Preview name={image.name} svg={image.svg} />
              <Heading level={3} data-size='2xs'>
                {index + 1}. {labels[index]}
              </Heading>
              <div className={classes.cardActions} data-color='accent'>
                <Button
                  type='button'
                  variant='secondary'
                  data-size='sm'
                  onClick={() => run(() => downloadPng(image, scale))}
                >
                  <DownloadIcon aria-hidden />
                  Last ned
                  <span className='ds-sr-only'> {labels[index]}</span>
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  data-size='sm'
                  onClick={() =>
                    run(
                      () => copyPng(image, scale),
                      `«${image.name}» er kopiert.`,
                    )
                  }
                >
                  <FilesIcon aria-hidden />
                  Kopier
                  <span className='ds-sr-only'> {labels[index]}</span>
                </Button>
                <Button
                  type='button'
                  variant='tertiary'
                  data-size='sm'
                  onClick={() => onEdit(index)}
                >
                  <PencilIcon aria-hidden />
                  Endre
                  <span className='ds-sr-only'> {labels[index]}</span>
                </Button>
              </div>
            </li>
          </Card>
        ))}
      </ul>
    </div>
  );
};
