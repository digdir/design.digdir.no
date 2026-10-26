import cl from 'clsx/lite';
import type { CSSProperties, Ref } from 'react';
import classes from './preview.module.css';

/** A rendered template, shown as one image to assistive technology. */
export const Preview = ({
  name,
  svg,
  ref,
  className,
  style,
}: {
  name: string;
  svg: string;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    ref={ref}
    className={cl(classes.canvas, className)}
    style={style}
    role='img'
    aria-label={`Forhåndsvisning av ${name}`}
    // biome-ignore lint/security/noDangerouslySetInnerHtml: template SVGs are part of this repo; user text is XML-escaped
    dangerouslySetInnerHTML={{ __html: svg }}
  />
);
