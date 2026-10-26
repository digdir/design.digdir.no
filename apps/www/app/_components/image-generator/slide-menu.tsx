import { Dropdown } from '@digdir/designsystemet-react';
import {
  DownloadIcon,
  FilesIcon,
  MenuElipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '@navikt/aksel-icons';
import { type ReactNode, useRef } from 'react';
import classes from './set-summary.module.css';

type Action = {
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
};

interface SlideMenuProps {
  /** Names the slide for assistive technology. */
  label: string;
  onDownload: () => void;
  onCopy: () => void;
  onEdit: () => void;
  /** Only for slides that can be removed. */
  onRemove?: () => void;
}

/** The actions for one slide of a set, behind a single menu button. */
export const SlideMenu = ({
  label,
  onDownload,
  onCopy,
  onEdit,
  onRemove,
}: SlideMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const actions: Action[] = [
    {
      label: 'Last ned PNG',
      icon: <DownloadIcon aria-hidden />,
      onSelect: onDownload,
    },
    {
      label: 'Kopier bilde',
      icon: <FilesIcon aria-hidden />,
      onSelect: onCopy,
    },
    { label: 'Endre', icon: <PencilIcon aria-hidden />, onSelect: onEdit },
    ...(onRemove
      ? [
          {
            label: 'Slett',
            icon: <TrashIcon aria-hidden />,
            onSelect: onRemove,
            danger: true,
          },
        ]
      : []),
  ];

  // Close the menu (focus returns to the trigger) before running the action.
  const select = (action: Action) => {
    try {
      menuRef.current?.hidePopover();
    } catch {
      // Already closed.
    }
    action.onSelect();
  };

  return (
    <Dropdown.TriggerContext>
      <Dropdown.Trigger variant='tertiary' data-size='sm' icon>
        <MenuElipsisVerticalIcon aria-hidden />
        <span className='ds-sr-only'>Valg for {label}</span>
      </Dropdown.Trigger>
      <Dropdown ref={menuRef} data-size='sm' placement='bottom-end'>
        <Dropdown.List>
          {actions.map((action) => (
            <Dropdown.Item key={action.label}>
              <Dropdown.Button
                className={classes.menuButton}
                data-color={action.danger ? 'danger' : undefined}
                onClick={() => select(action)}
              >
                {action.icon}
                {action.label}
              </Dropdown.Button>
            </Dropdown.Item>
          ))}
        </Dropdown.List>
      </Dropdown>
    </Dropdown.TriggerContext>
  );
};
