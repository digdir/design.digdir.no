import { Button } from '@digdir/designsystemet-react';
import cl from 'clsx/lite';
import { Outlet, Link as RRLink, useParams } from 'react-router';
import { ProfileSwitcher } from '~/_components/profile-switcher/profile-switcher';
import { ThemeToggle } from '~/_components/theme-toggle/theme-toggle';
import { getProfile } from '~/_config/profiles';
import classes from './layout.module.css';

export default function RootLayout() {
  const profile = getProfile(useParams().profile);

  return (
    <>
      <header className={classes.header} data-color='neutral'>
        <div className={classes.inner}>
          <RRLink to='/' className={cl(classes.logo, 'ds-focus')}>
            <span
              className={classes.logoMark}
              role='img'
              aria-label='design.digdir.no'
            />
          </RRLink>
          {profile && <ProfileSwitcher profile={profile} />}
          <div className={classes.actions}>
            {profile ? (
              <Button asChild variant='tertiary'>
                <RRLink to={`/${profile.slug}`}>Oversikt</RRLink>
              </Button>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id='main' className={classes.main}>
        <Outlet />
      </main>
    </>
  );
}
