import {
  Alert,
  Field,
  Label,
  Select,
  Spinner,
} from '@digdir/designsystemet-react';
import cl from 'clsx/lite';
import { useEffect, useState } from 'react';
import { mockupSource } from '~/_assets/mockups';
import { imageSource } from '~/_assets/templates';
import { Editor } from './editor';
import classes from './image-generator.module.css';
import { SetEditor } from './set-editor';

/** Where the templates come from: a folder in `app/_assets/`. */
const sources = {
  templates: imageSource,
  mockups: mockupSource,
};

interface ImageGeneratorProps {
  /** Which templates to offer. Defaults to `templates`. */
  source?: keyof typeof sources;
  /**
   * Template or template set selected initially (see the source's
   * `choices`). Defaults to the first one.
   */
  template?: string;
  className?: string;
}

/**
 * Pick an SVG template, edit its texts, upload images into its `[image]`
 * shapes and export the result as a PNG. The preview is the live SVG.
 *
 * A template set is filled in one step per template, followed by a step to
 * download each image or all of them as a zip.
 */
export const ImageGenerator = ({
  source = 'templates',
  template,
  className,
}: ImageGeneratorProps) => {
  const { templates, choices } = sources[source] ?? sources.templates;
  const choiceIds = Object.keys(choices);
  const [choiceId, setChoiceId] = useState(
    template && template in choices ? template : choiceIds[0],
  );
  // Designsystemet form fields set ids and sizing on the client, so render the
  // editor after mount to avoid hydration mismatches (as the signature
  // generator does).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const choice = choices[choiceId];

  // Template markup is loaded on demand (exports can be megabytes). A set
  // loads all its templates up front, as the last step shows them all.
  // Tagged with the choice it was loaded for: right after switching, the
  // previous choice's markup is still in state and must not be rendered.
  const [loaded, setLoaded] = useState<{ id: string; svgs: string[] } | null>(
    null,
  );
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    if (!choice) return;
    Promise.all(
      choice.steps.map((step) => templates[step.template].load()),
    ).then(
      (svgs) => !cancelled && setLoaded({ id: choiceId, svgs }),
      () => !cancelled && setLoadError(true),
    );
    return () => {
      cancelled = true;
    };
  }, [choice, choiceId, templates]);
  const svgs = loaded?.id === choiceId ? loaded.svgs : null;

  if (!choice) {
    return (
      <Alert data-color='warning' className={className}>
        Fant ikke malen «{choiceId}».
      </Alert>
    );
  }
  if (!mounted) {
    return <div className={cl(classes.generator, className)} aria-hidden />;
  }

  return (
    <div className={cl(classes.generator, className)}>
      {choiceIds.length > 1 && (
        <Field className={classes.templatePicker}>
          <Label>Mal</Label>
          <Select
            value={choiceId}
            onChange={(event) => setChoiceId(event.target.value)}
          >
            {choiceIds.map((id) => {
              const { name, steps } = choices[id];
              return (
                <Select.Option key={id} value={id}>
                  {steps.length > 1 ? `${name} (${steps.length} bilder)` : name}
                </Select.Option>
              );
            })}
          </Select>
        </Field>
      )}
      {loadError ? (
        <Alert data-color='danger'>
          Malen «{choice.name}» kunne ikke lastes. Prøv igjen senere.
        </Alert>
      ) : svgs === null ? (
        <div className={classes.loading}>
          <Spinner aria-label='Laster malen' />
        </div>
      ) : choice.steps.length > 1 ? (
        // Keyed so all state starts fresh when the choice changes.
        <SetEditor key={choiceId} set={choice} svgs={svgs} />
      ) : (
        <Editor
          key={choiceId}
          name={templates[choice.steps[0].template].name}
          svg={svgs[0]}
          exportable
        />
      )}
    </div>
  );
};

export default ImageGenerator;
