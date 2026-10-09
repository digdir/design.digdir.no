import { PersonSomGarMedSirkel } from '@digdir/design/illustrations/digdir/react';
import { Laptop } from '@digdir/design/illustrations/ki-norge/react';
import { dameHolderNettbrett } from '@digdir/design/illustrations/uutilsynet/images';
import { Heading, Link, Paragraph } from '@digdir/designsystemet-react';
import { ArrowRightIcon } from '@navikt/aksel-icons';
import cl from 'clsx/lite';
import type { CSSProperties, ReactNode } from 'react';
import { Link as RRLink } from 'react-router';
import { profiles } from '~/_config/profiles';
import { generateMetadata } from '~/_utils/metadata';
import classes from './home.module.css';

export const meta = () =>
  generateMetadata({
    title: 'Velg identitet',
    description: 'Velg hvilken identitet du vil se dokumentasjonen for.',
  });

/**
 * Artwork for an identity's card, keyed by profile slug. Profiles without one
 * get the placeholder `IdentityIllustration` in their brand colour.
 */
const cardIllustrations: Partial<
  Record<string, (className: string) => ReactNode>
> = {
  digdir: (className) => (
    <PersonSomGarMedSirkel sirkel='red' aria-hidden className={className} />
  ),
  uutilsynet: (className) => (
    <img src={dameHolderNettbrett} alt='' className={className} />
  ),
  'ki-norge': (className) => (
    <Laptop aria-hidden className={cl(className, classes.rounded)} />
  ),
};

export default function Home() {
  return (
    <div className={classes.page}>
      <div className={classes.intro}>
        <Heading level={1} data-size='lg'>
          Velg identitet
        </Heading>
        <Paragraph data-size='lg' className={classes.lead}>
          Velg hvilken identitet du vil se dokumentasjonen for. Hver identitet
          har egne profiler, komponenter og veiledning.
        </Paragraph>
      </div>

      <ul className={classes.grid}>
        {profiles.map((profile) => {
          const randId = Math.random().toString(36).slice(2, 7);
          const illustration = cardIllustrations[profile.slug];
          return (
            <li key={profile.slug}>
              <div
                className={classes.card}
                style={
                  {
                    '--card-color': profile.card.color,
                    '--card-heading-font': profile.card.headingFont,
                    '--card-text-font': profile.card.textFont,
                  } as CSSProperties
                }
                data-clickdelegatefor={randId}
                data-color-scheme='light'
                suppressHydrationWarning
              >
                <div className={classes.cardBody}>
                  <div className={classes.cardText}>
                    <Heading
                      level={2}
                      data-size='sm'
                      className={classes.cardHeading}
                    >
                      <RRLink
                        to={`/${profile.slug}`}
                        id={randId}
                        suppressHydrationWarning
                      >
                        {profile.name}
                      </RRLink>
                    </Heading>
                    <Paragraph className={classes.cardDescription}>
                      {profile.description}
                    </Paragraph>
                  </div>
                  <span className={classes.cta}>
                    Velg identiteten
                    <ArrowRightIcon aria-hidden='true' fontSize='1.5em' />
                  </span>
                </div>
                {illustration?.(classes.illustration)}
              </div>
            </li>
          );
        })}
      </ul>

      <div className={classes.help}>
        <Link asChild>
          <RRLink to='#' data-tooltip='Denne lenka funker ikke enda'>
            Usikker på hvilken du skal velge?
          </RRLink>
        </Link>
      </div>
    </div>
  );
}
