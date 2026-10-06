import type React from 'react';
import classes from './svg-embed.module.css';

interface SvgEmbedProps {
  href: string;
  /** Must match the viewBox of the referenced SVG, e.g. "0 0 1280 480" */
  viewBox: string;
}

const SvgEmbed: React.FC<SvgEmbedProps> = ({ href, viewBox }) => (
  <svg className={classes.svg} viewBox={viewBox} aria-hidden='true'>
    <use href={href} width='100%' height='100%'></use>
  </svg>
);

export default SvgEmbed;
