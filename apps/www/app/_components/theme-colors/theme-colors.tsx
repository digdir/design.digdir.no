import { Paragraph } from '@digdir/designsystemet-react';
import { useParams } from 'react-router';
import { getProfile } from '~/_config/profiles';
import { getThemeColors } from '~/_config/themes';
import classes from './theme-colors.module.css';

/** Severity colours every Designsystemet theme ships with. */
const SEVERITY_COLORS = ['info', 'success', 'warning', 'danger'];

/** The 16 unnamed `--ds-color-*` tokens, grouped as Designsystemet does. */
const TOKEN_GROUPS: Record<string, string[]> = {
  Bakgrunn: ['background-default', 'background-tinted'],
  Overflate: [
    'surface-default',
    'surface-tinted',
    'surface-hover',
    'surface-active',
  ],
  Kant: ['border-subtle', 'border-default', 'border-strong'],
  Tekst: ['text-subtle', 'text-default'],
  Base: [
    'base-default',
    'base-hover',
    'base-active',
    'base-contrast-subtle',
    'base-contrast-default',
  ],
};

/**
 * Every colour scale in the current profile's Designsystemet theme. Each row
 * sets `data-color` and paints the unnamed tokens, so it always matches the
 * generated CSS, in both light and dark mode.
 */
export const ThemeColors = () => {
  const { profile } = useParams();
  const colors = [
    ...getThemeColors(getProfile(profile)?.theme),
    ...SEVERITY_COLORS,
  ];

  return (
    <div className={classes.wrapper}>
      <table className={classes.table}>
        <thead>
          <tr>
            <td className={classes.name} />
            {Object.entries(TOKEN_GROUPS).map(([group, tokens]) => (
              <Paragraph key={group} data-size='xs' asChild>
                <th
                  className={classes.group}
                  colSpan={tokens.length}
                  scope='colgroup'
                >
                  {group}
                </th>
              </Paragraph>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color} data-color={color}>
              <Paragraph data-size='sm' asChild>
                <th className={classes.name} scope='row'>
                  <code>{color}</code>
                </th>
              </Paragraph>
              {Object.values(TOKEN_GROUPS)
                .flat()
                .map((token) => (
                  <td
                    key={token}
                    className={classes.swatch}
                    style={{ background: `var(--ds-color-${token})` }}
                    title={`--ds-color-${color}-${token}`}
                  >
                    <span className='ds-sr-only'>{token}</span>
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
