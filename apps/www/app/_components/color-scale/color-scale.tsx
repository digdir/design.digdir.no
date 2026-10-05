import { Paragraph } from '@digdir/designsystemet-react';
import cl from 'clsx/lite';
import classes from './color-scale.module.css';

interface ColorScaleProps {
  /**
   * Shades from lightest to darkest, keyed by name, e.g.
   * `{ '20 % Blå': '#D1EAFE', '100 % Blå': '#1E98F5' }`. Hex with or without `#`.
   */
  colors: Record<string, string>;
  className?: string;
}

/** Row of shades joined into one strip, with name and hex under each. */
export const ColorScale = ({ colors, className }: ColorScaleProps) => (
  <div className={cl(classes.container, className)}>
    <ul className={classes.scale}>
      {Object.entries(colors).map(([name, hex]) => {
        const code = hex.replace(/^#/, '').toUpperCase();

        return (
          <li key={name} className={classes.shade}>
            <span
              className={classes.swatch}
              style={{ background: `#${code}` }}
            />
            <span className={classes.text}>
              <Paragraph asChild>
                <span>{name}</span>
              </Paragraph>
              <Paragraph className={classes.hex} data-size='sm' asChild>
                <span>HEX: {code.startsWith('#') ? code : `#${code}`}</span>
              </Paragraph>
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);
