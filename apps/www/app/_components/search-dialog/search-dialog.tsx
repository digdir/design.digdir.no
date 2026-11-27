import {
  Button,
  Chip,
  Dialog,
  Heading,
  Link,
  Paragraph,
  Skeleton,
  EXPERIMENTAL_Suggestion as Suggestion,
  Tag,
} from '@digdir/designsystemet-react';
import { FileSearchIcon } from '@navikt/aksel-icons';
import cl from 'clsx/lite';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link as RRLink } from 'react-router';
import { getProfile, type Profile } from '~/_config/profiles';
import { highlightText } from '~/_utils/highlight';
import { SITE_NAME } from '~/_utils/metadata';
import classes from './search-dialog.module.css';

type SearchResult = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  profile: string;
};

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Search in this profile. Without it, all profiles are searched. */
  profile?: Profile;
};

const SUGGESTIONS = ['Logo', 'Farger', 'Typografi', 'Illustrasjoner'];

export const SearchDialog = ({ open, onClose, profile }: SearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultAnnounce, setResultAnnounce] = useState('');
  const searchRef = useRef<AbortController | null>(null);
  const announceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  // The input isn't controlled, as Suggestion manages its value
  const inputRef = useRef<HTMLInputElement>(null);
  const hasQuery = Boolean(query.trim());

  useEffect(() => {
    if (resultsRef.current && query.trim().length > 1 && results.length) {
      highlightText(query, resultsRef.current);
    }
  }, [query, results]);

  // Delay the screen reader announcement so it is not interrupted by typing
  // (Apple VoiceOver)
  const announce = (text: string) => {
    clearTimeout(announceRef.current);
    announceRef.current = setTimeout(() => setResultAnnounce(text), 1000);
  };

  const performSearch = async (value: string) => {
    searchRef.current?.abort(); // Cancel searches that are still in flight
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setIsLoading(false);
      announce('');
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    searchRef.current = controller;
    try {
      const params = new URLSearchParams({ q: value });
      if (profile) params.set('profile', profile.slug);
      const response = await fetch(`/api/search?${params}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Search failed: ${response.status}`);
      const { results = [] } = await response.json();
      if (controller.signal.aborted) return;
      setResults(results);
      announce(`fant ${results.length} resultater for ${value}`);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Search error:', error);
      setResults([]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  const searchFor = (value: string) => {
    if (inputRef.current) inputRef.current.value = value;
    performSearch(value);
  };

  const handleClose = () => {
    // Use the native close() so the modal dialog is removed from the top
    // layer. The native `close` event then resets state and notifies the
    // parent (see Dialog onClose).
    dialogRef.current?.close();
  };

  const handleDialogClose = () => {
    searchFor('');
    onClose();
  };

  return (
    <Dialog
      ref={dialogRef}
      closedby='any'
      open={open}
      onClose={handleDialogClose}
      className={cl(classes.dialog, 'search-dialog')}
      closeButton={false}
    >
      <Button
        aria-label='Lukk søk'
        data-color='neutral'
        icon
        variant='tertiary'
        data-command='close'
      />
      <div className={classes.aboveScroll}>
        <Dialog.Block className={classes.searchBlock}>
          <Heading data-size='sm' className={classes.title}>
            Hva leter du etter?
          </Heading>
          <Suggestion>
            <Suggestion.Input
              ref={inputRef}
              type='search'
              className={classes.input}
              autoFocus={true}
              aria-label={`Søk i ${profile?.name ?? 'alle profiler'}`}
              placeholder={`Søk i ${profile?.name ?? 'alle profiler'}…`}
              onInput={(e) => performSearch(e.currentTarget.value)}
            />
            <Suggestion.Clear onClick={() => performSearch('')} />
          </Suggestion>
          <div
            className='ds-sr-only'
            aria-live='assertive'
            aria-atomic='true'
            aria-relevant='text'
          >
            {resultAnnounce}
          </div>
        </Dialog.Block>
      </div>

      <div className={classes.resultsContainer}>
        {isLoading && results.length === 0 && (
          <section className={classes.resultsBlock}>
            <div className={classes.result}>
              <Skeleton variant='text' width={30} />
              <Skeleton variant='rectangle' height={80} />
            </div>
            <div className={classes.result}>
              <Skeleton variant='text' width={40} />
              <Skeleton variant='rectangle' height={80} />
            </div>
          </section>
        )}

        {results.length > 0 && (
          <>
            <Heading className={classes.iconHeading} data-size='sm'>
              <FileSearchIcon aria-hidden='true' /> Søkeresultater
            </Heading>
            <section className={classes.resultsBlock} ref={resultsRef}>
              {results.map((result, i) => {
                // The category says most inside a profile, the profile's
                // name when searching all of them.
                const tag = profile
                  ? result.category
                  : getProfile(result.profile)?.name;

                return (
                  <div
                    key={result.id}
                    style={{ '--i': `${i}` } as CSSProperties}
                    className={classes.result}
                  >
                    <div className={classes.resultHeader}>
                      <h3 className={classes.resultTitle}>
                        <Link asChild>
                          <RRLink to={result.url} onClick={handleClose}>
                            {result.title}
                          </RRLink>
                        </Link>
                      </h3>
                      {tag && (
                        <Tag data-size='sm' data-color='neutral'>
                          {tag}
                        </Tag>
                      )}
                    </div>
                    <Paragraph className={classes.resultContent}>
                      {result.description}
                    </Paragraph>
                    <Paragraph className={classes.resultUrl} data-size='xs'>
                      https://{SITE_NAME}
                      {result.url}
                    </Paragraph>
                  </div>
                );
              })}
            </section>
          </>
        )}

        {!hasQuery && (
          <div className={classes.resultsBlock}>
            <Paragraph className={classes.suggestionsTitle}>
              Prøv å søke etter…
            </Paragraph>
            <div className={classes.suggestionsList}>
              {SUGGESTIONS.map((suggestion) => (
                <Chip.Button
                  key={suggestion}
                  onClick={() => searchFor(suggestion)}
                >
                  {suggestion}
                </Chip.Button>
              ))}
            </div>
          </div>
        )}

        {hasQuery && !isLoading && results.length === 0 && (
          <div className={classes.noResults}>
            Ingen resultater funnet for «{query}»
          </div>
        )}
      </div>
    </Dialog>
  );
};
