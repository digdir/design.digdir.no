import {
  Button,
  Card,
  Field,
  // Experimental in Designsystemet 1.x; drop the alias when it graduates.
  EXPERIMENTAL_FileUpload as FileUpload,
  Label,
  Paragraph,
  ValidationMessage,
} from '@digdir/designsystemet-react';
import { ImageIcon, ScissorsIcon, TrashIcon } from '@navikt/aksel-icons';
import { useId, useRef, useState } from 'react';
import { readImageFile } from '~/_utils/image-file';
import { ImageCropDialog } from './image-crop-dialog';
import classes from './image-field.module.css';
import type { ImageShape } from './measure';
import type { ImageFill, Rect } from './svg-template';

const sanitizeImageSrc = (candidate: string): string | null => {
  const trimmed = candidate.trim();
  return /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=]+$/i.test(
    trimmed,
  )
    ? trimmed
    : null;
};

interface ImageFieldProps {
  label: string;
  value: string;
  /** Size and crop of the chosen image. */
  fill?: ImageFill;
  /** The shape the image fills, once measured. Needed for cropping. */
  shape?: ImageShape;
  onChange: (dataUrl: string, size?: { width: number; height: number }) => void;
  onCrop: (crop: Rect) => void;
}

/**
 * Upload for an `[image]` shape: Designsystemet drop zone plus the chosen
 * file. A file that can't be used is reported right under the field, with
 * `aria-invalid` on the input, per Designsystemet's error pattern.
 */
export const ImageField = ({
  label,
  value,
  fill,
  shape,
  onChange,
  onCrop,
}: ImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const src = sanitizeImageSrc(value);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { src, width, height } = await readImageFile(file);
      onChange(src, { width, height });
      setFileName(file.name);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Bildet kunne ikke leses. Prøv en annen fil.',
      );
      resetInput();
    }
  };

  const clear = () => {
    onChange('');
    setFileName(null);
    setError(null);
    resetInput();
  };

  return (
    <Field className={classes.field} data-size='sm'>
      <Label htmlFor={inputId}>{label}</Label>
      <FileUpload className={classes.dropZone}>
        <ImageIcon aria-hidden='true' />
        <Field.Description>
          {src ? 'Slipp et nytt bilde her' : 'Slipp et bilde her'}
        </Field.Description>
        <Field.Description>PNG, JPEG eller WebP</Field.Description>
        <Button asChild variant='secondary'>
          <span>{src ? 'Bytt bilde' : 'Velg bilde'}</span>
        </Button>
        <input
          ref={inputRef}
          id={inputId}
          type='file'
          accept='image/*'
          aria-invalid={error ? true : undefined}
          onChange={(event) => pick(event.target.files?.[0])}
        />
      </FileUpload>
      <div aria-live='polite'>
        {error && <ValidationMessage>{error}</ValidationMessage>}
      </div>
      {src && (
        <Card className={classes.chosen}>
          <img src={src} alt='' className={classes.thumbnail} />
          <Paragraph className={classes.fileName}>{fileName}</Paragraph>
          <div className={classes.actions}>
            {fill && shape && (
              <Button
                type='button'
                variant='secondary'
                onClick={() => setCropping(true)}
              >
                <ScissorsIcon aria-hidden />
                Juster utsnitt
                <span className='ds-sr-only'> for {label}</span>
              </Button>
            )}
            <Button type='button' variant='tertiary' onClick={clear}>
              <TrashIcon aria-hidden />
              Fjern
              <span className='ds-sr-only'> {label}</span>
            </Button>
          </div>
          {fill && shape && (
            <ImageCropDialog
              open={cropping}
              label={label}
              src={src}
              image={fill}
              shape={shape}
              crop={fill.crop}
              onApply={onCrop}
              onClose={() => setCropping(false)}
            />
          )}
        </Card>
      )}
    </Field>
  );
};
