import { Button, Link } from '@digdir/designsystemet-react';
import { ChevronDownIcon } from '@navikt/aksel-icons';
import cl from 'clsx/lite';
import { useEffect, useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import type { Profile } from '~/_config/profiles';
import classes from './sidebar.module.css';

export type SidebarLink = { title: string; url: string };
export type SidebarGroups = Record<string, SidebarLink[]>;

export type SidebarProps = {
  /** The currently active profile. */
  profile: Profile;
  groups: SidebarGroups;
  /** Hide category headings when content isn't grouped into named categories. */
  hideGroupTitle?: boolean;
};

export const Sidebar = ({ profile, groups, hideGroupTitle }: SidebarProps) => (
  <aside className={cl(classes.sidebar, 'l-sidebar-left')}>
    <nav aria-label={profile.name} data-color='neutral'>
      {Object.entries(groups).map(([category, links]) =>
        !hideGroupTitle && category ? (
          <CollapsibleGroup key={category} title={category} links={links} />
        ) : (
          <div key={category} className={classes.group}>
            <LinkList links={links} />
          </div>
        ),
      )}
    </nav>
  </aside>
);

const CollapsibleGroup = ({
  title,
  links,
}: {
  title: string;
  links: SidebarLink[];
}) => {
  const [open, setOpen] = useState(true);
  const { pathname } = useLocation();
  const listId = useId();
  const containsActive = links.some((link) => link.url === pathname);

  // Make sure the group with the current page is visible after navigating.
  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <div className={classes.group}>
      <h3 className={classes.groupHeading}>
        <Button
          className={classes.groupToggle}
          data-size='sm'
          data-variant='tertiary'
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDownIcon
            className={classes.groupChevron}
            fontSize='1.25rem'
            aria-hidden
          />
          {title}
        </Button>
      </h3>
      <LinkList id={listId} links={links} hidden={!open} />
    </div>
  );
};

const LinkList = ({
  links,
  id,
  hidden,
}: {
  links: SidebarLink[];
  id?: string;
  hidden?: boolean;
}) => (
  <ul id={id} hidden={hidden}>
    {links.map((link) => (
      <li key={link.url}>
        <Link asChild>
          <NavLink to={link.url} end className={classes.link}>
            {link.title}
          </NavLink>
        </Link>
      </li>
    ))}
  </ul>
);
