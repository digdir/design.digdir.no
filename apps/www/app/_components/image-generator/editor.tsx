import { Button, Paragraph, Textfield } from '@digdir/designsystemet-react';
import { ArrowUndoIcon } from '@navikt/aksel-icons';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import classes from './editor.module.css';
import type { RenderedImage } from './export';
import { ExportActions } from './export-controls';
import { ImageField } from './image-field';
import { useMeasurements } from './measure';
import { Preview } from './preview';
import { type ImageFill, parseTemplate } from './svg-template';

interface EditorProps {
  name: string;
  svg: string;
  /** Inactive editors keep their state but drop the preview. */
  active?: boolean;
  /** Show size, download and copy under the preview. */
  exportable?: boolean;
  /** Called with the current image whenever it changes. */
  onRender?: (image: RenderedImage) => void;
}

const setAt = <T,>(list: T[], index: number, value: T) => {
  const next = [...list];
  next[index] = value;
  return next;
};

/** Form fields for one template next to its live preview. */
export const Editor = memo(
  ({
    name,
    svg: templateSvg,
    active = true,
    exportable = false,
    onRender,
  }: EditorProps) => {
    const parsed = useMemo(() => parseTemplate(templateSvg), [templateSvg]);
    const defaults = () => parsed.fields.map((field) => field.defaultValue);
    const [values, setValues] = useState(defaults);
    const [images, setImages] = useState<(ImageFill | undefined)[]>([]);

    const previewRef = useRef<HTMLDivElement>(null);
    const measurements = useMeasurements(previewRef, parsed);

    const svg = useMemo(
      () =>
        measurements
          ? parsed.render(values, measurements.widths, images)
          : parsed.measure,
      [parsed, values, measurements, images],
    );

    useEffect(() => {
      onRender?.({ name, svg, width: parsed.width, height: parsed.height });
    }, [onRender, name, svg, parsed]);

    return (
      <div className={classes.container} data-color='neutral'>
        <form
          className={classes.form}
          onSubmit={(event) => event.preventDefault()}
        >
          {parsed.fields.map((field, index) =>
            field.kind === 'image' ? (
              <ImageField
                key={index}
                label={field.label}
                value={values[index]}
                fill={images[index]}
                shape={measurements?.shapes[index]}
                onChange={(value, size) => {
                  setValues((current) => setAt(current, index, value));
                  setImages((current) => setAt(current, index, size));
                }}
                onCrop={(crop) =>
                  setImages((current) =>
                    setAt(
                      current,
                      index,
                      current[index] && { ...current[index], crop },
                    ),
                  )
                }
              />
            ) : (
              <Textfield
                key={index}
                multiline
                label={field.label}
                rows={Math.max(field.rows, 1)}
                value={values[index]}
                onChange={(event) =>
                  setValues((current) =>
                    setAt(current, index, event.target.value),
                  )
                }
              />
            ),
          )}
          {parsed.fields.length > 0 ? (
            <div>
              <Button
                type='button'
                variant='tertiary'
                data-size='sm'
                onClick={() => {
                  setValues(defaults());
                  setImages([]);
                }}
              >
                <ArrowUndoIcon aria-hidden />
                Nullstill
              </Button>
            </div>
          ) : (
            <Paragraph>Dette bildet har ingen felt å fylle ut.</Paragraph>
          )}
        </form>

        <div className={classes.preview}>
          {/* Rendered until measured even when inactive, as measuring needs it. */}
          {(active || !measurements) && (
            <Preview ref={previewRef} name={name} svg={svg} />
          )}
          {exportable && (
            <ExportActions
              image={{ name, svg, width: parsed.width, height: parsed.height }}
            />
          )}
        </div>
      </div>
    );
  },
);
