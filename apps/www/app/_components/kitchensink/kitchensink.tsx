import {
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  Details,
  Dialog,
  Divider,
  Dropdown,
  ErrorSummary,
  Field,
  Fieldset,
  Heading,
  Label,
  Link,
  Pagination,
  Paragraph,
  Popover,
  Radio,
  Search,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Table,
  Tabs,
  Tag,
  Textfield,
  ToggleGroup,
  Tooltip,
  usePagination,
} from '@digdir/designsystemet-react';
import {
  ChevronDownIcon,
  HeartIcon,
  InboxIcon,
  PencilIcon,
  TrashIcon,
} from '@navikt/aksel-icons';
import { type ReactNode, useState } from 'react';
import { useParams } from 'react-router';
import { getProfile } from '~/_config/profiles';
import { getThemeColors } from '~/_config/themes';
import classes from './kitchensink.module.css';

const SEVERITY_COLORS = ['info', 'success', 'warning', 'danger'] as const;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className={classes.section}>
    <Heading level={3} data-size='2xs' className={classes.sectionTitle}>
      {title}
    </Heading>
    <div className={classes.row}>{children}</div>
  </section>
);

const PaginationExample = () => {
  const [currentPage, setCurrentPage] = useState(3);
  const { pages, prevButtonProps, nextButtonProps } = usePagination({
    currentPage,
    setCurrentPage,
    totalPages: 10,
    showPages: 7,
  });

  return (
    <Pagination aria-label='Sidenavigering'>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Button {...prevButtonProps}>Forrige</Pagination.Button>
        </Pagination.Item>
        {pages.map(({ page, itemKey, buttonProps }) => (
          <Pagination.Item key={itemKey}>
            {typeof page === 'number' && (
              <Pagination.Button {...buttonProps} aria-label={`Side ${page}`}>
                {page}
              </Pagination.Button>
            )}
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Button {...nextButtonProps}>Neste</Pagination.Button>
        </Pagination.Item>
      </Pagination.List>
    </Pagination>
  );
};

/**
 * A kitchensink of Designsystemet components in the current profile's theme.
 * A toggle switches `data-color` on the whole sink, so every main colour the
 * theme defines can be checked against every component at once.
 */
export const Kitchensink = () => {
  const { profile: slug } = useParams();
  const profile = getProfile(slug);
  const colors = getThemeColors(profile?.theme);
  const [color, setColor] = useState(colors[0]);

  return (
    <div className={classes.kitchensink} data-color={color}>
      <div className={classes.toolbar}>
        <Paragraph data-size='sm' asChild>
          <span id='kitchensink-color'>Farge</span>
        </Paragraph>
        <ToggleGroup
          value={color}
          onChange={setColor}
          data-size='sm'
          aria-labelledby='kitchensink-color'
        >
          {colors.map((c) => (
            <ToggleGroup.Item key={c} value={c}>
              {c}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>

      <div className={classes.canvas}>
        <Section title='Button'>
          <Button variant='primary'>Primary</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='tertiary'>Tertiary</Button>
          <Button variant='primary' disabled>
            Disabled
          </Button>
          <Button variant='primary' loading>
            Laster
          </Button>
          <Button variant='secondary' icon aria-label='Rediger'>
            <PencilIcon aria-hidden />
          </Button>
          <Button variant='tertiary' data-color='danger'>
            <TrashIcon aria-hidden />
            Slett
          </Button>
        </Section>

        <Section title='Link, Badge, Tag og Avatar'>
          <Link href='#kitchensink'>En lenke</Link>
          <Badge.Position>
            <Badge count={12} maxCount={9} />
            <InboxIcon aria-hidden fontSize='2rem' />
          </Badge.Position>
          <Badge count={3} />
          <Badge count={42} variant='tinted' />
          <Tag>Standard</Tag>
          <Tag data-variant='outline'>Outline</Tag>
          {SEVERITY_COLORS.map((c) => (
            <Tag key={c} data-color={c}>
              {c}
            </Tag>
          ))}
          <Avatar aria-label='Ola Nordmann' initials='ON' />
          <Avatar aria-label='Ola Nordmann' variant='square' />
        </Section>

        <Section title='Chip'>
          <Chip.Radio name='kitchensink-chip' defaultChecked>
            Bokmål
          </Chip.Radio>
          <Chip.Radio name='kitchensink-chip'>Nynorsk</Chip.Radio>
          <Chip.Checkbox defaultChecked>Avkrysset</Chip.Checkbox>
          <Chip.Removable aria-label='Slett Oslo'>Oslo</Chip.Removable>
          <Chip.Button>Knapp</Chip.Button>
        </Section>

        <Section title='Skjemaelementer'>
          <div className={classes.stack}>
            <Textfield
              label='Navn'
              description='Fornavn og etternavn'
              defaultValue='Ola Nordmann'
            />
            <Textfield
              label='E-post'
              error='Du må fylle inn en gyldig e-postadresse.'
            />
            <Textfield label='Beløp' prefix='NOK' suffix='kr' />
            <Textfield
              label='Melding'
              multiline
              rows={3}
              counter={200}
              // `ds-field` sets the textarea's id and auto-size style before
              // React hydrates.
              suppressHydrationWarning
            />
            <Field>
              <Label>Fylke</Label>
              <Select defaultValue='oslo'>
                <Select.Option value='oslo'>Oslo</Select.Option>
                <Select.Option value='vestland'>Vestland</Select.Option>
                <Select.Option value='nordland'>Nordland</Select.Option>
              </Select>
            </Field>
            <Search>
              <Search.Input aria-label='Søk' />
              <Search.Clear />
              <Search.Button />
            </Search>
          </div>
          <div className={classes.stack}>
            <Fieldset>
              <Fieldset.Legend>Hvilken frukt liker du?</Fieldset.Legend>
              <Fieldset.Description>Velg én.</Fieldset.Description>
              <Radio label='Eple' name='kitchensink-fruit' defaultChecked />
              <Radio label='Banan' name='kitchensink-fruit' />
              <Radio label='Pære' name='kitchensink-fruit' disabled />
            </Fieldset>
            <Fieldset>
              <Fieldset.Legend>Varsler</Fieldset.Legend>
              <Checkbox label='E-post' defaultChecked />
              <Checkbox label='SMS' />
              <Checkbox label='Brev' disabled />
            </Fieldset>
            <Fieldset>
              <Fieldset.Legend>Innstillinger</Fieldset.Legend>
              <Switch label='Mørk modus' defaultChecked />
              <Switch label='Kompakt visning' />
            </Fieldset>
          </div>
        </Section>

        <Section title='ToggleGroup og Tabs'>
          <div className={classes.stack}>
            <ToggleGroup defaultValue='uke' data-toggle-group='Periode'>
              <ToggleGroup.Item value='dag'>Dag</ToggleGroup.Item>
              <ToggleGroup.Item value='uke'>Uke</ToggleGroup.Item>
              <ToggleGroup.Item value='maned'>Måned</ToggleGroup.Item>
            </ToggleGroup>
            <Tabs defaultValue='oversikt'>
              <Tabs.List>
                <Tabs.Tab value='oversikt'>Oversikt</Tabs.Tab>
                <Tabs.Tab value='detaljer'>Detaljer</Tabs.Tab>
                <Tabs.Tab value='historikk'>Historikk</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value='oversikt'>Innhold for oversikt.</Tabs.Panel>
              <Tabs.Panel value='detaljer'>Innhold for detaljer.</Tabs.Panel>
              <Tabs.Panel value='historikk'>Innhold for historikk.</Tabs.Panel>
            </Tabs>
          </div>
        </Section>

        <Section title='Navigasjon'>
          <div className={classes.stack}>
            <Breadcrumbs aria-label='Du er her:'>
              <Breadcrumbs.Link
                href='#kitchensink'
                aria-label='Tilbake til Nivå 3'
              >
                Nivå 3
              </Breadcrumbs.Link>
              <Breadcrumbs.List>
                <Breadcrumbs.Item>
                  <Breadcrumbs.Link href='#kitchensink'>
                    Nivå 1
                  </Breadcrumbs.Link>
                </Breadcrumbs.Item>
                <Breadcrumbs.Item>
                  <Breadcrumbs.Link href='#kitchensink'>
                    Nivå 2
                  </Breadcrumbs.Link>
                </Breadcrumbs.Item>
                <Breadcrumbs.Item>
                  <Breadcrumbs.Link href='#kitchensink'>
                    Nivå 3
                  </Breadcrumbs.Link>
                </Breadcrumbs.Item>
              </Breadcrumbs.List>
            </Breadcrumbs>
            <PaginationExample />
          </div>
        </Section>

        <Section title='Dropdown, Popover, Tooltip og Dialog'>
          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant='secondary'>
              Meny
              <ChevronDownIcon aria-hidden />
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.Heading>Valg</Dropdown.Heading>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button>Rediger</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button>Del</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>
          <Popover.TriggerContext>
            <Popover.Trigger variant='secondary'>Popover</Popover.Trigger>
            <Popover>Dette er en popover.</Popover>
          </Popover.TriggerContext>
          <Tooltip content='Legg til i favoritter'>
            <Button variant='tertiary' icon>
              <HeartIcon aria-hidden />
            </Button>
          </Tooltip>
          <Dialog.TriggerContext>
            <Dialog.Trigger>Åpne dialog</Dialog.Trigger>
            <Dialog closedby='any'>
              <Heading
                level={2}
                data-size='xs'
                style={{ marginBottom: 'var(--ds-size-2)' }}
              >
                Dialog
              </Heading>
              <Paragraph>
                Dialoger bruker temaets farger og avrunding.
              </Paragraph>
            </Dialog>
          </Dialog.TriggerContext>
        </Section>

        <Section title='Alert og ErrorSummary'>
          <div className={classes.stack}>
            {SEVERITY_COLORS.map((c) => (
              <Alert key={c} data-color={c}>
                Dette er en <code>{c}</code>-melding.
              </Alert>
            ))}
          </div>
          <div className={classes.stack}>
            <ErrorSummary>
              <ErrorSummary.Heading>
                For å gå videre må du rette opp følgende feil:
              </ErrorSummary.Heading>
              <ErrorSummary.List>
                <ErrorSummary.Item>
                  <ErrorSummary.Link href='#kitchensink'>
                    Fødselsdato kan ikke være etter år 2005
                  </ErrorSummary.Link>
                </ErrorSummary.Item>
                <ErrorSummary.Item>
                  <ErrorSummary.Link href='#kitchensink'>
                    Telefonnummer kan kun inneholde siffer
                  </ErrorSummary.Link>
                </ErrorSummary.Item>
              </ErrorSummary.List>
            </ErrorSummary>
          </div>
        </Section>

        <Section title='Card og Details'>
          <Card className={classes.card}>
            <Heading level={4} data-size='2xs'>
              Card (default)
            </Heading>
            <Paragraph>Et kort med standard variant.</Paragraph>
          </Card>
          <Card className={classes.card} data-variant='tinted'>
            <Heading level={4} data-size='2xs'>
              Card (tinted)
            </Heading>
            <Paragraph>Et kort med tonet bakgrunn.</Paragraph>
          </Card>
          <Card className={classes.card} asChild>
            <a href='#kitchensink'>
              <Heading level={4} data-size='2xs'>
                Klikkbart kort
              </Heading>
              <Paragraph>Hele kortet er en lenke.</Paragraph>
            </a>
          </Card>
          <div className={classes.stack}>
            <Details>
              <Details.Summary>Hva er Designsystemet?</Details.Summary>
              <Details.Content>
                Et felles designsystem for offentlige digitale tjenester.
              </Details.Content>
            </Details>
            <Details defaultOpen>
              <Details.Summary>Åpen som standard</Details.Summary>
              <Details.Content>Innholdet vises med en gang.</Details.Content>
            </Details>
          </div>
        </Section>

        <Section title='Table'>
          <Table zebra border className={classes.table}>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell sort='ascending'>Navn</Table.HeaderCell>
                <Table.HeaderCell>Rolle</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Kari</Table.Cell>
                <Table.Cell>Designer</Table.Cell>
                <Table.Cell>
                  <Tag data-color='success'>Aktiv</Tag>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Per</Table.Cell>
                <Table.Cell>Utvikler</Table.Cell>
                <Table.Cell>
                  <Tag data-color='warning'>Borte</Tag>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Ali</Table.Cell>
                <Table.Cell>Produkteier</Table.Cell>
                <Table.Cell>
                  <Tag data-color='success'>Aktiv</Tag>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Section>

        <Section title='Lasting og Divider'>
          <Spinner aria-label='Laster' />
          <Spinner aria-label='Laster' data-size='lg' />
          <div className={classes.stack}>
            <Skeleton variant='text' width={20} />
            <Skeleton variant='rectangle' height='4rem' />
            <Skeleton variant='circle' width='3rem' height='3rem' />
          </div>
          <Divider className={classes.divider} />
        </Section>
      </div>
    </div>
  );
};
