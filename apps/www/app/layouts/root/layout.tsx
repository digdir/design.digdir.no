import { Button } from '@digdir/designsystemet-react';
import cl from 'clsx/lite';
import { useCallback, useState } from 'react';
import { Outlet, Link as RRLink, useParams } from 'react-router';
import { Footer } from '~/_components/footer/footer';
import { ProfileSwitcher } from '~/_components/profile-switcher/profile-switcher';
import { SearchDialog } from '~/_components/search-dialog/search-dialog';
import { SearchTrigger } from '~/_components/search-dialog/search-trigger';
import { ThemeToggle } from '~/_components/theme-toggle/theme-toggle';
import { getProfile } from '~/_config/profiles';
import classes from './layout.module.css';

export default function RootLayout() {
  const profile = getProfile(useParams().profile);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

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
            <SearchTrigger onClick={openSearch} />
          </div>
        </div>
      </header>
      <SearchDialog
        open={isSearchOpen}
        onClose={closeSearch}
        profile={profile}
      />
      <main id='main' className={classes.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
