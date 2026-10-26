import { Button, Heading } from '@digdir/designsystemet-react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
} from '@navikt/aksel-icons';
import { useEffect, useRef, useState } from 'react';
import type { ImageTemplateSet } from '~/_assets/templates';
import { Editor } from './editor';
import type { RenderedImage } from './export';
import classes from './set-editor.module.css';
import { SetSummary } from './set-summary';

/** One image in the set: an instance of one of its steps. */
type Slide = { id: number; step: number };

/**
 * One step per slide, then a step to download them all. Every slide's
 * editor stays mounted, so nothing typed is lost when moving between steps;
 * the inactive ones are hidden and `inert`. Repeatable steps can be added
 * again, right after their last copy.
 */
export const SetEditor = ({
  set,
  svgs,
}: {
  set: ImageTemplateSet;
  svgs: string[];
}) => {
  const [slides, setSlides] = useState<Slide[]>(() =>
    set.steps.map((_, step) => ({ id: step, step })),
  );
  const nextId = useRef(set.steps.length);
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<Record<number, RenderedImage>>({});

  const copiesOf = (step: number) =>
    slides.filter((slide) => slide.step === step);
  const canAdd = (step: number) => {
    const { repeatable, max = Infinity } = set.steps[step];
    return !!repeatable && copiesOf(step).length < max;
  };
  const canRemove = (step: number) =>
    !!set.steps[step].repeatable && copiesOf(step).length > 1;
  const labels = [
    ...slides.map((slide) => {
      const { label } = set.steps[slide.step];
      const copies = copiesOf(slide.step);
      return copies.length > 1
        ? `${label} ${copies.indexOf(slide) + 1}`
        : label;
    }),
    'Last ned',
  ];
  const summary = slides.length;
  // Numbered by position, so the files sort in the order of the set.
  const digits = String(slides.length).length;
  const fileName = (index: number) =>
    `${set.name} - ${String(index + 1).padStart(digits, '0')} ${labels[index]}`;

  // Stable per slide, so editors that didn't change skip re-rendering.
  const renderHandlers = useRef(
    new Map<number, (image: RenderedImage) => void>(),
  );
  const onRenderFor = (id: number) => {
    let handler = renderHandlers.current.get(id);
    if (!handler) {
      handler = (image) => setImages((all) => ({ ...all, [id]: image }));
      renderHandlers.current.set(id, handler);
    }
    return handler;
  };

  // Move focus to the step heading after navigating (not on first render),
  // so keyboard and screen reader users land at the new content.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusPending = useRef(false);
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    headingRef.current?.focus();
  });
  const goTo = (index: number) => {
    focusPending.current = true;
    setCurrent(index);
  };

  const add = (step: number) => {
    const index = slides.indexOf(copiesOf(step).at(-1) as Slide) + 1;
    const slide = { id: nextId.current++, step };
    setSlides([...slides.slice(0, index), slide, ...slides.slice(index)]);
    goTo(index);
  };

  const remove = (index: number) => {
    const { id, step } = slides[index];
    const remaining = slides.filter((slide) => slide.id !== id);
    setSlides(remaining);
    setImages(({ [id]: _, ...rest }) => rest);
    renderHandlers.current.delete(id);
    if (current === summary) {
      goTo(remaining.length);
    } else {
      // Stay among the copies that are left.
      goTo(remaining[index]?.step === step ? index : index - 1);
    }
  };

  const slide = slides[current];
  const step = slide && set.steps[slide.step];

  return (
    <div className={classes.set}>
      <nav aria-label={`Steg i ${set.name}`}>
        <ol className={classes.steps}>
          {labels.map((label, index) => (
            <li key={slides[index]?.id ?? 'summary'}>
              <button
                type='button'
                className={classes.step}
                aria-current={index === current ? 'step' : undefined}
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

      <div className={classes.stepHeader}>
        <Heading
          ref={headingRef}
          level={2}
          data-size='xs'
          tabIndex={-1}
          className={classes.stepHeading}
        >
          Steg {current + 1} av {labels.length}: {labels[current]}
        </Heading>
        {slide && canRemove(slide.step) && (
          <Button
            type='button'
            variant='tertiary'
            data-color='danger'
            data-size='sm'
            onClick={() => remove(current)}
          >
            <TrashIcon aria-hidden />
            Fjern {labels[current].toLowerCase()}
          </Button>
        )}
      </div>

      {slides.map(({ id, step }, index) => (
        <div
          key={id}
          className={index === current ? undefined : classes.offstage}
          inert={index !== current}
        >
          <Editor
            name={fileName(index)}
            svg={svgs[step]}
            active={index === current}
            onRender={onRenderFor(id)}
          />
        </div>
      ))}

      {current === summary && (
        <SetSummary
          name={set.name}
          labels={labels}
          images={slides.flatMap(({ id }) => images[id] ?? [])}
          onEdit={goTo}
          canRemove={(index) => canRemove(slides[index].step)}
          onRemove={remove}
          adders={set.steps.flatMap(({ label }, index) =>
            canAdd(index)
              ? [
                  {
                    after: slides.indexOf(copiesOf(index).at(-1) as Slide),
                    label: label.toLowerCase(),
                    onAdd: () => add(index),
                  },
                ]
              : [],
          )}
        />
      )}

      <div className={classes.stepNav}>
        {current > 0 && (
          <Button variant='secondary' onClick={() => goTo(current - 1)}>
            <ArrowLeftIcon aria-hidden />
            Forrige: {labels[current - 1]}
          </Button>
        )}
        {current < summary && (
          <div className={classes.next}>
            {canAdd(slide.step) && (
              <Button variant='secondary' onClick={() => add(slide.step)}>
                <PlusIcon aria-hidden />
                Legg til {step.label.toLowerCase()}
              </Button>
            )}
            <Button onClick={() => goTo(current + 1)}>
              Neste: {labels[current + 1]}
              <ArrowRightIcon aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
