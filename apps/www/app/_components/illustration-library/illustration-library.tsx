import type {
  IllustrationMeta,
  IllustrationProfile,
} from '@digdir/design/illustrations';
import {
  Alert,
  Chip,
  Field,
  Fieldset,
  Label,
  Paragraph,
  Search,
  Spinner,
} from '@digdir/designsystemet-react';
import cl from 'clsx/lite';
import { Suspense, use, useState } from 'react';
import { useParams } from 'react-router';
import {
  getIllustrationLibrary,
  hasIllustrationLibrary,
  type IllustrationLibrary as IllustrationLibraryData,
} from '~/_config/illustrations';
import { IllustrationDialog } from './illustration-dialog';
import classes from './illustration-library.module.css';
import {
  preferredSlotValues,
  selectableColors,
  slotStyle,
} from './preferred-color';

interface IllustrationLibraryProps {
  /**
   * Profile whose illustrations to show. Defaults to the profile of the page
   * the component is rendered on, so the same `<IllustrationLibrary />` works
   * in every profile's docs.
   */
  profile?: string;
  className?: string;
}

/** Searchable, filterable gallery of a profile's illustrations. */
export const IllustrationLibrary = ({
  profile: profileProp,
  className,
}: IllustrationLibraryProps) => {
  const params = useParams();
  const profile = profileProp ?? params.profile;

  if (!hasIllustrationLibrary(profile)) {
    return (
      <Alert data-color='info' className={className}>
        Det finnes ingen illustrasjoner for denne profilen enda.
      </Alert>
    );
  }

  return (
    <div className={cl(classes.library, 'u-wide', className)}>
      <Suspense
        fallback={
          <div className={classes.loading}>
            <Spinner aria-label='Laster illustrasjoner' />
          </div>
        }
      >
        <Gallery profile={profile} />
      </Suspense>
    </div>
  );
};

const matchesQuery = (item: IllustrationMeta, query: string) => {
  const haystack = [
    item.title,
    item.name,
    item.format === 'svg' ? item.componentName : '',
    item.description ?? '',
    ...item.tags,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
};

/** Chip label for illustrations without a `project`. */
const STANDARD_LABEL = 'Standard';

const Gallery = ({ profile }: { profile: IllustrationProfile }) => {
  const library: IllustrationLibraryData = use(getIllustrationLibrary(profile));
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<IllustrationMeta | null>(null);
  /** Palette colour to show every recolourable part in; null = as drawn. */
  const colorOptions = selectableColors(library);
  const [preferred, setPreferred] = useState<string | null>(
    colorOptions[0]?.name ?? null,
  );

  /**
   * Project illustrations stay hidden until their project is picked;
   * null = the profile's standard illustrations.
   */
  const projects = [
    ...new Set(library.illustrations.flatMap((item) => item.project ?? [])),
  ].sort((a, b) => a.localeCompare(b, 'nb'));
  const [project, setProject] = useState<string | null>(null);
  const inProject = library.illustrations.filter(
    (item) => (item.project ?? null) === project,
  );

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? inProject.filter((item) => matchesQuery(item, normalized))
    : inProject;

  const total = inProject.length;
  const countText = normalized
    ? `Viser ${filtered.length} av ${total} illustrasjoner`
    : `${total} illustrasjoner`;

  return (
    <>
      <div className={classes.filters}>
        <Field>
          <Label>Søk i illustrasjoner</Label>
          <Search>
            <Search.Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete='off'
            />
            <Search.Clear onClick={() => setQuery('')} />
          </Search>
        </Field>

        {colorOptions.length > 0 && (
          <Fieldset data-color='neutral'>
            <Fieldset.Legend>Farge</Fieldset.Legend>
            <div className={classes.chips}>
              {colorOptions.map((color) => (
                <Chip.Radio
                  key={color.name}
                  name='preferred-color'
                  value={color.name}
                  checked={preferred === color.name}
                  onChange={() => setPreferred(color.name)}
                >
                  {color.label}
                  <span
                    className={classes.swatch}
                    style={{ background: `var(${color.variable})` }}
                    aria-hidden='true'
                  />
                </Chip.Radio>
              ))}
            </div>
          </Fieldset>
        )}

        {projects.length > 0 && (
          <Fieldset data-color='neutral'>
            <Fieldset.Legend>Prosjekt</Fieldset.Legend>
            <div className={classes.chips}>
              {[null, ...projects].map((name) => (
                <Chip.Radio
                  key={name ?? STANDARD_LABEL}
                  name='project'
                  value={name ?? ''}
                  checked={project === name}
                  onChange={() => setProject(name)}
                >
                  {name ?? STANDARD_LABEL}
                </Chip.Radio>
              ))}
            </div>
          </Fieldset>
        )}
      </div>

      <section className={classes.results} aria-label='Illustrasjoner'>
        <Paragraph
          data-size='sm'
          className={classes.count}
          aria-live='polite'
          aria-atomic='true'
        >
          {countText}
        </Paragraph>

        {filtered.length === 0 ? (
          <Paragraph className={classes.empty}>
            Ingen illustrasjoner passer til søket. Prøv et annet ord.
          </Paragraph>
        ) : (
          <ul className={classes.grid}>
            {filtered.map((item) => (
              <li key={item.name}>
                <button
                  type='button'
                  className={cl(classes.tile, 'ds-focus')}
                  aria-haspopup='dialog'
                  onClick={() => setSelected(item)}
                >
                  {item.format === 'svg' ? (
                    <span
                      className={classes.tilePreview}
                      // Fixed-colour illustrations are drawn for light backgrounds.
                      data-color-scheme={library.darkMode ? undefined : 'light'}
                      style={slotStyle(
                        library,
                        item,
                        preferredSlotValues(item, preferred),
                      )}
                      aria-hidden='true'
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG strings are generated from our own repo at build time
                      dangerouslySetInnerHTML={{
                        __html: library.svgs[item.exportName] ?? '',
                      }}
                    />
                  ) : (
                    <span
                      className={classes.tilePreview}
                      data-color-scheme='light'
                      aria-hidden='true'
                    >
                      <img
                        src={library.images[item.exportName]}
                        alt=''
                        loading='lazy'
                      />
                    </span>
                  )}
                  <span className={classes.tileTitle}>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <IllustrationDialog
        item={selected}
        library={library}
        preferredColor={preferred}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default IllustrationLibrary;
