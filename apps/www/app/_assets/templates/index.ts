/**
 * SVG templates for the image generator. Add a template by dropping the
 * Illustrator export in a folder next to this file and listing it here.
 * Templates are loaded on demand – an export with embedded images can be
 * megabytes, and it should not weigh down the page until chosen.
 *
 * In Illustrator: every text object becomes an editable field, and a shape
 * whose layer name ends in `[image]` (e.g. "Bilde [image]") becomes an image
 * upload that fills the shape. Layer names are used as field labels. The name
 * may sit on the object itself or on the layer/group that wraps only it.
 *
 * Illustrator does not export text alignment, so mark it in the layer name:
 * `Navn [center]` or `Dato [right]`. Text without a marker is left-aligned.
 * Limit the number of lines in the same brackets: `Navn [center,lines=1]`.
 *
 * Templates that belong together (e.g. the slides of a carousel) are grouped
 * in `imageTemplateSets`. A set is filled in one step per template and can be
 * downloaded as a zip; its templates are not offered on their own. A step
 * marked `repeatable` can be added as many times as the user needs (up to
 * `max`, if set), next to its other copies.
 */
export type ImageTemplate = {
  /** Shown in the template chooser and used as the download file name. */
  name: string;
  /** Loads the SVG markup. */
  load: () => Promise<string>;
};

const raw = (loader: () => Promise<{ default: string }>) => () =>
  loader().then((module) => module.default);

export const imageTemplates = {
  'brukarraadet-2026/karusell/forsidebilde': {
    name: 'Brukarrådet 2026 - Karusell 1',
    load: raw(
      () =>
        import('./brukarraadet-2026/karusell/Karusell forsidebilde.svg?raw'),
    ),
  },
  'brukarraadet-2026/karusell/personbilde': {
    name: 'Brukarrådet 2026 - Karusell 2',
    load: raw(
      () => import('./brukarraadet-2026/karusell/Karusell personbilde.svg?raw'),
    ),
  },
  'brukarraadet-2026/karusell/avslutningsbilde': {
    name: 'Brukarrådet 2026 - Karusell 3',
    load: raw(
      () =>
        import(
          './brukarraadet-2026/karusell/Karusell avslutningsbilde.svg?raw'
        ),
    ),
  },
  'brukarraadet-2026/visste-du-at/forsidebilde': {
    name: 'Brukarrådet 2026 - Visste du at 1',
    load: raw(
      () => import('./brukarraadet-2026/visste-du-at/forsidebilde.svg?raw'),
    ),
  },
  'brukarraadet-2026/visste-du-at/avslutningsbilde': {
    name: 'Brukarrådet 2026 - Visste du at 2',
    load: raw(
      () => import('./brukarraadet-2026/visste-du-at/avslutningsbilde.svg?raw'),
    ),
  },
  'brukarraadet-2026/2-innledere': {
    name: 'Brukarrådet 2026 - Presentasjon av 2 innledere',
    load: raw(
      () =>
        import(
          './brukarraadet-2026/2-innledere/Presentasjon av 2 innledere.svg?raw'
        ),
    ),
  },
  'brukarraadet-2026/3-innledere': {
    name: 'Brukarrådet 2026 - Presentasjon av 3 innledere',
    load: raw(
      () =>
        import(
          './brukarraadet-2026/2-innledere/Presentasjon av 3 innledere.svg?raw'
        ),
    ),
  },
  'test-template-bilde': {
    name: 'Testmal med bilde',
    load: raw(() => import('./test-template-bilde.svg?raw')),
  },
} satisfies Record<string, ImageTemplate>;

export type ImageTemplateId = keyof typeof imageTemplates;

export const imageTemplateIds = Object.keys(
  imageTemplates,
) as ImageTemplateId[];

export type ImageTemplateSet = {
  /** Shown in the template chooser and used as the zip file name. */
  name: string;
  /** One step per template, in order. `label` names the step. */
  steps: {
    template: ImageTemplateId;
    label: string;
    repeatable?: boolean;
    /** Most copies of a repeatable step. */
    max?: number;
  }[];
};

export const imageTemplateSets = {
  'brukarraadet-2026/karusell': {
    name: 'Brukarrådet 2026 - Karusell',
    steps: [
      {
        template: 'brukarraadet-2026/karusell/forsidebilde',
        label: 'Forsidebilde',
      },
      {
        template: 'brukarraadet-2026/karusell/personbilde',
        label: 'Personbilde',
        repeatable: true,
        max: 3,
      },
      {
        template: 'brukarraadet-2026/karusell/avslutningsbilde',
        label: 'Avslutningsbilde',
      },
    ],
  },
  'brukarraadet-2026/visste-du-at': {
    name: 'Brukarrådet 2026 - Visste du at …?',
    steps: [
      {
        template: 'brukarraadet-2026/visste-du-at/forsidebilde',
        label: 'Forsidebilde',
      },
      {
        template: 'brukarraadet-2026/visste-du-at/avslutningsbilde',
        label: 'Avslutningsbilde',
      },
    ],
  },
} satisfies Record<string, ImageTemplateSet>;

const templatesInSets = new Set<ImageTemplateId>(
  Object.values(imageTemplateSets).flatMap((set) =>
    set.steps.map((step) => step.template),
  ),
);

/**
 * What the template chooser offers: every set, plus each template that is not
 * part of a set as a set of one.
 */
export const imageChoices: Record<string, ImageTemplateSet> = {
  ...imageTemplateSets,
  ...Object.fromEntries(
    imageTemplateIds
      .filter((id) => !templatesInSets.has(id))
      .map((id) => [
        id,
        {
          name: imageTemplates[id].name,
          steps: [{ template: id, label: imageTemplates[id].name }],
        },
      ]),
  ),
};

export const imageChoiceIds = Object.keys(imageChoices);
