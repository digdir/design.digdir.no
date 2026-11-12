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
  /** Categories that start closed, unless they hold the current page. */
  collapsed?: string[];
};

export const Sidebar = ({
  profile,
  groups,
  hideGroupTitle,
  collapsed,
}: SidebarProps) => (
  <aside className={cl(classes.sidebar, 'l-sidebar-left')}>
    <nav aria-label={profile.name} data-color='neutral'>
      {Object.entries(groups).map(([category, links]) =>
        !hideGroupTitle && category ? (
          <CollapsibleGroup
            key={category}
            title={category}
            links={links}
            defaultOpen={!collapsed?.includes(category)}
          />
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
  defaultOpen,
}: {
  title: string;
  links: SidebarLink[];
  defaultOpen: boolean;
}) => {
  const { pathname } = useLocation();
  const listId = useId();
  // Prerendered pages are requested with a trailing slash.
  const currentPath = pathname.replace(/\/+$/, '');
  const containsActive = links.some((link) => link.url === currentPath);
  const [open, setOpen] = useState(defaultOpen || containsActive);

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
