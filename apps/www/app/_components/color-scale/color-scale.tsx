import { Paragraph } from '@digdir/designsystemet-react';
import cl from 'clsx/lite';
import classes from './color-scale.module.css';

/** A hex string, or the hex plus other values keyed by label. */
type Shade = string | ({ hex: string } & Record<string, string>);

interface ColorScaleProps {
  /**
   * Shades from lightest to darkest, keyed by name. Each is a hex value, or
   * an object with `hex` and any other values to list under it, e.g.
   * `{ '20 % Rød': { hex: '#FCDFE1', RGB: '252, 223, 225' } }`.
   * Hex with or without `#`.
   */
  colors: Record<string, Shade>;
  className?: string;
}

/** Row of shades joined into one strip, with name and values under each. */
export const ColorScale = ({ colors, className }: ColorScaleProps) => (
  <div className={cl(classes.container, className)}>
    <ul className={classes.scale}>
      {Object.entries(colors).map(([name, shade]) => {
        const { hex, ...values } =
          typeof shade === 'string' ? { hex: shade } : shade;
        const code = `#${hex.replace(/^#/, '').toUpperCase()}`;
        const rows = Object.entries({ HEX: code, ...values });

        return (
          <li key={name} className={classes.shade}>
            <span className={classes.swatch} style={{ background: code }} />
            <span className={classes.text}>
              <Paragraph asChild>
                <span>{name}</span>
              </Paragraph>
              {rows.map(([label, value]) => (
                <Paragraph
                  key={label}
                  className={classes.value}
                  data-size='sm'
                  asChild
                >
                  <span>
                    {label}: <span className={classes.nowrap}>{value}</span>
                  </span>
                </Paragraph>
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);
