import type { Ref } from 'react';
import classes from './preview.module.css';

/** A rendered template, shown as one image to assistive technology. */
export const Preview = ({
  name,
  svg,
  ref,
}: {
  name: string;
  svg: string;
  ref?: Ref<HTMLDivElement>;
}) => (
  <div
    ref={ref}
    className={classes.canvas}
    role='img'
    aria-label={`Forhåndsvisning av ${name}`}
    // biome-ignore lint/security/noDangerouslySetInnerHtml: template SVGs are part of this repo; user text is XML-escaped
    dangerouslySetInnerHTML={{ __html: svg }}
  />
);
