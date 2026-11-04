import { Dropdown } from '@digdir/designsystemet-react';
import { ChevronDownIcon } from '@navikt/aksel-icons';
import { useEffect, useState } from 'react';
import { Link as RRLink, useLocation } from 'react-router';
import { type Profile, profiles } from '~/_config/profiles';
import classes from './profile-switcher.module.css';

export type ProfileSwitcherProps = {
  /** The currently active profile, shown in the trigger. */
  profile: Profile;
};

export const ProfileSwitcher = ({ profile }: ProfileSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <Dropdown.TriggerContext>
      <Dropdown.Trigger
        variant='secondary'
        data-color='neutral'
        className={classes.switcher}
      >
        <span
          className={classes.dot}
          style={{ background: profile.color }}
          aria-hidden
        />
        <span className={classes.name}>{profile.name}</span>
        <ChevronDownIcon
          className={classes.chevron}
          fontSize='1.25rem'
          aria-hidden
        />
      </Dropdown.Trigger>
      <Dropdown
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        placement='bottom-start'
        data-color='neutral'
      >
        <Dropdown.List>
          {profiles.map((item) => (
            <Dropdown.Item key={item.slug}>
              <Dropdown.Button asChild>
                <RRLink
                  to={`/${item.slug}`}
                  className={classes.option}
                  aria-current={item.slug === profile.slug ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span
                    className={classes.dot}
                    style={{ background: item.color }}
                    aria-hidden
                  />
                  {item.name}
                </RRLink>
              </Dropdown.Button>
            </Dropdown.Item>
          ))}
        </Dropdown.List>
      </Dropdown>
    </Dropdown.TriggerContext>
  );
};
