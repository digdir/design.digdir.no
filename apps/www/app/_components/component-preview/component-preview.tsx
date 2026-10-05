import { Paragraph } from '@digdir/designsystemet-react';
import { useParams } from 'react-router';
import { getProfile } from '~/_config/profiles';
import { getThemeColors } from '~/_config/themes';
import { CopyButton } from '../copy-button/copy-button';
import classes from './component-preview.module.css';

type ComponentPreviewProps = {
  /**
   * Plain HTML for the example. Written as HTML (not React) so the snippet is
   * exactly what consumers copy, whatever framework they use.
   */
  html: string;
  /** Hide the code block under the preview. */
  hideCode?: boolean;
};

/** Strip the shared indentation and surrounding blank lines of a snippet. */
const dedent = (text: string) => {
  const lines = text.replace(/^\s*\n|\n\s*$/g, '').split('\n');
  const indent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^\s*/)?.[0].length ?? 0),
  );
  return lines.map((line) => line.slice(indent)).join('\n');
};

/** Renders an HTML example with its source code underneath. */
export const ComponentPreview = ({ html, hideCode }: ComponentPreviewProps) => {
  const code = dedent(html);

  return (
    <div className={classes.preview}>
      <div
        className={classes.canvas}
        // Web components (e.g. `<ds-tabs>`) add attributes before hydration.
        suppressHydrationWarning
        // biome-ignore lint/security/noDangerouslySetInnerHtml: author-written docs examples
        dangerouslySetInnerHTML={{ __html: code }}
      />
      {!hideCode && (
        <div className={classes.code}>
          <pre>
            <code className='language-html'>{code}</code>
          </pre>
          <CopyButton
            text={code}
            variant='tertiary'
            data-size='sm'
            data-color='neutral'
            className={classes.copy}
          >
            Kopier
          </CopyButton>
        </div>
      )}
    </div>
  );
};

type ColorPreviewProps = {
  /** Plain HTML for the example, rendered once per colour. */
  html: string;
  /** Colours to show. Defaults to the current profile's main colours. */
  colors?: string[];
};

/**
 * Renders an HTML example once per `data-color`, so readers can see every
 * colour a component comes in for the current profile.
 */
export const ColorPreview = ({ html, colors }: ColorPreviewProps) => {
  const { profile } = useParams();
  const code = dedent(html);
  const shown = colors ?? getThemeColors(getProfile(profile)?.theme);

  return (
    <div className={classes.colors}>
      {shown.map((color) => (
        <figure key={color} className={classes.color}>
          <div
            className={classes.canvas}
            data-color={color}
            suppressHydrationWarning
            // biome-ignore lint/security/noDangerouslySetInnerHtml: author-written docs examples
            dangerouslySetInnerHTML={{ __html: code }}
          />
          <Paragraph asChild data-size='sm'>
            <figcaption>
              <code>data-color="{color}"</code>
            </figcaption>
          </Paragraph>
        </figure>
      ))}
    </div>
  );
};
