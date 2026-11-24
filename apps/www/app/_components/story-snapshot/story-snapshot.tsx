import { Link, Paragraph } from '@digdir/designsystemet-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CopyButton } from '../copy-button/copy-button';
import classes from './story-snapshot.module.css';

type StorySnapshotProps = {
  /** Navnet på komponenten, brukes som tilgjengelig navn på rammen. */
  title: string;
  /** Statisk HTML og CSS hentet fra Storybook, under `public/`. */
  src: string;
  /** Den interaktive storyen. Interne stier åpnes i rammen, eksterne i Storybook. */
  storybook?: string;
};

/**
 * Viser en komponent som statisk HTML og CSS hentet fra Storybook, i en
 * isolert ramme slik at stilene ikke blandes med nettstedet. Rammen får
 * høyden til innholdet. Lastes først når den er i nærheten av skjermen.
 */
export const StorySnapshot = ({
  title,
  src,
  storybook,
}: StorySnapshotProps) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(120);
  const [interactive, setInteractive] = useState(false);
  const [html, setHtml] = useState('');
  const internal = storybook?.startsWith('/');

  const fit = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    // scrollHeight på <html> blir aldri lavere enn rammen, så vi måler <body>.
    const measure = () =>
      setHeight(
        Math.max(48, Math.ceil(doc.body.getBoundingClientRect().height)),
      );
    measure();
    new ResizeObserver(measure).observe(doc.body);
  }, []);

  // Rammen kan ha lastet før React tok over siden, så vi lytter selv i tillegg.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    if (el.contentDocument?.readyState === 'complete') fit();
    el.addEventListener('load', fit);
    return () => el.removeEventListener('load', fit);
  }, [fit]);

  useEffect(() => {
    let active = true;
    fetch(src)
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => {
        if (!active) return;
        const doc = new DOMParser().parseFromString(text, 'text/html');
        setHtml(doc.querySelector('#story')?.innerHTML.trim() ?? '');
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [src]);

  return (
    <div className={classes.snapshot}>
      <iframe
        ref={frame}
        className={classes.frame}
        title={`${title}, eksempel`}
        src={interactive && storybook ? storybook : src}
        loading='lazy'
        style={{ height }}
      />
      <div className={classes.bar}>
        {storybook &&
          (internal ? (
            <button
              type='button'
              className={classes.toggle}
              aria-pressed={interactive}
              onClick={() => setInteractive((on) => !on)}
            >
              {interactive ? 'Vis statisk' : 'Prøv interaktivt'}
            </button>
          ) : (
            <Paragraph data-size='sm' asChild>
              <Link href={storybook}>Åpne i Storybook</Link>
            </Paragraph>
          ))}
        {html && (
          <CopyButton
            text={html}
            variant='tertiary'
            data-size='sm'
            data-color='neutral'
          >
            Kopier HTML
          </CopyButton>
        )}
      </div>
    </div>
  );
};
