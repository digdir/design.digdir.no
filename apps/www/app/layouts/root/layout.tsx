import cl from 'clsx/lite';
import { Outlet, Link as RRLink } from 'react-router';
import { ThemeToggle } from '~/_components/theme-toggle/theme-toggle';
import classes from './layout.module.css';

export default function RootLayout() {
  return (
    <>
      <header className={classes.header}>
        <div className={classes.inner}>
          <RRLink to='/' className={cl(classes.logo, 'ds-focus')}>
            <span
              className={classes.logoMark}
              role='img'
              aria-label='design.digdir.no'
            />
          </RRLink>
          <div className={classes.actions}>
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
