import { Button, Heading } from '@digdir/designsystemet-react';
import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type ImageTemplateSet, imageTemplates } from '~/_assets/templates';
import { Editor } from './editor';
import type { RenderedImage } from './export';
import classes from './set-editor.module.css';
import { SetSummary } from './set-summary';

/**
 * One step per template, then a step to download them all. Every step's
 * editor stays mounted, so nothing typed is lost when moving between steps;
 * the inactive ones are hidden and `inert`.
 */
export const SetEditor = ({
  set,
  svgs,
}: {
  set: ImageTemplateSet;
  svgs: string[];
}) => {
  const labels = [...set.steps.map((step) => step.label), 'Last ned'];
  const summary = set.steps.length;
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<(RenderedImage | null)[]>(() =>
    set.steps.map(() => null),
  );

  // Stable per step, so editors that didn't change skip re-rendering.
  const onRender = useMemo(
    () =>
      set.steps.map(
        (_, index) => (image: RenderedImage) =>
          setImages((current) =>
            current.map((existing, i) => (i === index ? image : existing)),
          ),
      ),
    [set.steps],
  );

  // Move focus to the step heading when the step changes (not on first
  // render), so keyboard and screen reader users land at the new content.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  useEffect(() => {
    if (navigated.current) headingRef.current?.focus();
  }, [step]);
  const goTo = (index: number) => {
    navigated.current = true;
    setStep(index);
  };

  return (
    <div className={classes.set}>
      <nav aria-label={`Steg i ${set.name}`}>
        <ol className={classes.steps}>
          {labels.map((label, index) => (
            <li key={label}>
              <button
                type='button'
                className={classes.step}
                aria-current={index === step ? 'step' : undefined}
                onClick={() => goTo(index)}
              >
                <span className={classes.stepNumber} aria-hidden='true'>
                  {index + 1}
                </span>
                {label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <Heading
        ref={headingRef}
        level={2}
        data-size='xs'
        tabIndex={-1}
        className={classes.stepHeading}
      >
        Steg {step + 1} av {labels.length}: {labels[step]}
      </Heading>

      {set.steps.map(({ template }, index) => (
        <div
          key={template}
          className={index === step ? undefined : classes.offstage}
          inert={index !== step}
        >
          <Editor
            name={imageTemplates[template].name}
            svg={svgs[index]}
            active={index === step}
            onRender={onRender[index]}
          />
        </div>
      ))}

      {step === summary && (
        <SetSummary
          name={set.name}
          labels={labels}
          images={images.filter((image) => image !== null)}
          onEdit={goTo}
        />
      )}

      <div className={classes.stepNav}>
        {step > 0 && (
          <Button variant='secondary' onClick={() => goTo(step - 1)}>
            <ArrowLeftIcon aria-hidden />
            Forrige: {labels[step - 1]}
          </Button>
        )}
        {step < summary && (
          <Button className={classes.next} onClick={() => goTo(step + 1)}>
            Neste: {labels[step + 1]}
            <ArrowRightIcon aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
};
