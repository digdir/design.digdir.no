import { Heading, Link, Paragraph } from '@digdir/designsystemet-react';
import { PersonSomGarMedSirkel } from '@digdir/varde/illustrations/digdir/react';
import { LaptopMedBakgrunn } from '@digdir/varde/illustrations/ki-norge/react';
import { dameHolderNettbrett } from '@digdir/varde/illustrations/uutilsynet/images';
import cl from 'clsx/lite';
import type { CSSProperties, ReactNode } from 'react';
import { Link as RRLink } from 'react-router';
import { IdentityIllustration } from '~/_components/identity-illustration/identity-illustration';
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
    <LaptopMedBakgrunn aria-hidden className={cl(className, classes.rounded)} />
  ),
};

const ArrowRight = () => (
  <svg viewBox='0 0 20 20' width='1.1em' height='1.1em' aria-hidden='true'>
    <path
      d='M4 10h12M11 5l5 5-5 5'
      stroke='currentColor'
      strokeWidth='1.8'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

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
                style={{ '--identity-color': profile.color } as CSSProperties}
                data-clickdelegatefor={randId}
              >
                <div className={classes.cardBody}>
                  <div className={classes.cardText}>
                    <Heading level={2} data-size='sm'>
                      <RRLink to={`/${profile.slug}`} id={randId}>
                        {profile.name}
                      </RRLink>
                    </Heading>
                    <Paragraph className={classes.cardDescription}>
                      {profile.description}
                    </Paragraph>
                  </div>
                  <span className={classes.cta}>
                    Velg identiteten
                    <ArrowRight />
                  </span>
                </div>
                {illustration ? (
                  illustration(classes.illustration)
                ) : (
                  <IdentityIllustration
                    color={profile.color}
                    className={classes.illustration}
                  />
                )}
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
