import {
  Alert,
  Button,
  Field,
  Label,
  Select,
} from '@digdir/designsystemet-react';
import { DownloadIcon, FilesIcon } from '@navikt/aksel-icons';
import { useState } from 'react';
import {
  copyPng,
  downloadPng,
  type RenderedImage,
  type Scale,
  scales,
} from './export';
import classes from './export-controls.module.css';

type Status = { kind: 'success' | 'error'; message: string } | null;

/** Runs an export and keeps its outcome for `StatusMessage`. */
export const useExportStatus = () => {
  const [status, setStatus] = useState<Status>(null);
  const run = async (task: () => Promise<unknown>, success?: string) => {
    setStatus(null);
    try {
      await task();
      if (success) setStatus({ kind: 'success', message: success });
    } catch (error) {
      setStatus({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Bildet kunne ikke lages. Prøv igjen.',
      });
    }
  };
  return { status, run };
};

/** Always rendered, so screen readers announce messages put into it. */
export const StatusMessage = ({ status }: { status: Status }) => (
  <div aria-live='polite'>
    {status && (
      <Alert
        data-size='sm'
        data-color={status.kind === 'error' ? 'danger' : 'success'}
      >
        {status.message}
      </Alert>
    )}
  </div>
);

/**
 * Export size as a multiple of the template's own. Shown in pixels when all
 * images share a size, otherwise as a factor.
 */
export const SizeSelect = ({
  images,
  value,
  onChange,
}: {
  images: RenderedImage[];
  value: Scale;
  onChange: (scale: Scale) => void;
}) => {
  const [first] = images;
  const sameSize = images.every(
    (image) => image.width === first?.width && image.height === first?.height,
  );
  return (
    <Field className={classes.size}>
      <Label>Størrelse</Label>
      <Select
        data-size='sm'
        value={value}
        onChange={(event) => onChange(Number(event.target.value) as Scale)}
      >
        {scales.map((factor) => (
          <Select.Option key={factor} value={factor}>
            {first && sameSize
              ? `${Math.round(first.width * factor)} × ${Math.round(first.height * factor)} px`
              : factor === 1
                ? 'Original størrelse'
                : `${factor} × original størrelse`}
          </Select.Option>
        ))}
      </Select>
    </Field>
  );
};

export const ExportActions = ({ image }: { image: RenderedImage }) => {
  const [scale, setScale] = useState<Scale>(1);
  const { status, run } = useExportStatus();

  return (
    <>
      <div className={classes.actions} data-color='accent'>
        <SizeSelect images={[image]} value={scale} onChange={setScale} />
        <Button
          type='button'
          data-size='sm'
          onClick={() => run(() => downloadPng(image, scale))}
        >
          <DownloadIcon aria-hidden />
          Last ned PNG
        </Button>
        <Button
          type='button'
          variant='secondary'
          data-size='sm'
          onClick={() => run(() => copyPng(image, scale), 'Bildet er kopiert.')}
        >
          <FilesIcon aria-hidden />
          Kopier bilde
        </Button>
      </div>
      <StatusMessage status={status} />
    </>
  );
};
