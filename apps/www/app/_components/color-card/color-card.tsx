import { Heading, Paragraph } from '@digdir/designsystemet-react';
import cl from 'clsx/lite';
import type { ReactNode } from 'react';
import classes from './color-card.module.css';

interface ColorCardProps {
  /** Colour name shown as the card heading. */
  name: string;
  /** Hex value used for the swatch, and listed first. With or without `#`. */
  hex: string;
  /**
   * Other colour values, keyed by label, e.g.
   * `{ RGB: '194, 19, 44', 'PMS C': '1805 C' }`. Listed in insertion order.
   */
  values?: Record<string, string>;
  className?: string;
}

/** Swatch with the colour's name and values in each colour system. */
export const ColorCard = ({ name, hex, values, className }: ColorCardProps) => {
  const code = hex.replace(/^#/, '').toUpperCase();
  const rows = Object.entries({ HEX: code, ...values });

  return (
    <div className={cl(classes.card, className)}>
      <div className={classes.swatch} style={{ background: `#${code}` }} />
      <Heading level={3} data-size='xs'>
        {name}
      </Heading>
      <dl className={classes.values}>
        {rows.map(([label, value]) => (
          <Paragraph key={label} data-size='sm' asChild>
            <div>
              <dt>{label}:</dt> <dd>{value}</dd>
            </div>
          </Paragraph>
        ))}
      </dl>
    </div>
  );
};

/** Responsive grid for a row of `ColorCard`s. */
export const ColorCards = ({ children }: { children: ReactNode }) => (
  <div className={classes.grid}>{children}</div>
);
