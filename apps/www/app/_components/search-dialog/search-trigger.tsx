import { Button } from '@digdir/designsystemet-react';
import { MagnifyingGlassIcon } from '@navikt/aksel-icons';
import { useEffect } from 'react';

/** The search button in the header. Also opens search on Ctrl/⌘ + K. */
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  return (
    <Button
      type='button'
      onClick={onClick}
      aria-label='Søk'
      data-variant='tertiary'
      aria-keyshortcuts='Control+k'
      aria-haspopup='dialog'
      data-icon
    >
      <MagnifyingGlassIcon aria-hidden='true' />
    </Button>
  );
}
