import { Heading, Link, Paragraph } from '@digdir/designsystemet-react';
import type { ReactNode } from 'react';
import classes from './footer.module.css';

type FooterLink = { text: string; url: string; icon?: ReactNode };

const GithubIcon = () => (
  <svg
    viewBox='0 0 16 16'
    width='1em'
    height='1em'
    fill='currentColor'
    aria-hidden='true'
  >
    <path d='M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z' />
  </svg>
);

const contactLinks: FooterLink[] = [
  {
    text: 'GitHub',
    url: 'https://github.com/digdir/design.digdir.no',
    icon: <GithubIcon />,
  },
];

export const Footer = () => (
  <footer
    className={classes.footer}
    data-color='neutral'
    data-color-scheme='dark'
  >
    <div className={classes.top}>
      <div className={classes.container}>
        <div className={classes.about}>
          <span
            className={classes.logo}
            role='img'
            aria-label='design.digdir.no'
          />
          <Paragraph data-size='sm' className={classes.description}>
            design.digdir.no samler de visuelle identitetene til
            Digitaliseringsdirektoratet, med profiler, komponenter og
            veiledning.
          </Paragraph>
        </div>
        <LinkColumn title='Kom i kontakt med oss' links={contactLinks} />
      </div>
    </div>
    <div className={classes.bottom}>
      <div className={classes.container}>
        <Paragraph data-size='sm'>
          © {new Date().getFullYear()} Digitaliseringsdirektoratet
        </Paragraph>
      </div>
    </div>
  </footer>
);

const LinkColumn = ({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) => (
  <div>
    <Heading level={2} data-size='2xs' className={classes.title}>
      {title}
    </Heading>
    <ul className={classes.links}>
      {links.map((link) => (
        <li key={link.url}>
          {link.icon}
          <Link href={link.url}>{link.text}</Link>
        </li>
      ))}
    </ul>
  </div>
);
