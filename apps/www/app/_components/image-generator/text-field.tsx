import { Textfield } from '@digdir/designsystemet-react';
import type { TemplateField } from './svg-template';

interface TextFieldProps {
  field: Extract<TemplateField, { kind: 'text' }>;
  value: string;
  onChange: (value: string) => void;
}

/**
 * A text field of a template. A one-line limit is a plain input; otherwise
 * extra lines are kept, but reported as left out of the image.
 */
export const TextField = ({ field, value, onChange }: TextFieldProps) => {
  const { label, rows, maxLines } = field;

  if (maxLines === 1) {
    return (
      <Textfield
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  const lineCount = value.split('\n').length;
  return (
    <Textfield
      multiline
      label={label}
      rows={maxLines ?? Math.max(rows, 1)}
      description={maxLines && `Maks ${maxLines} linjer`}
      error={
        maxLines &&
        lineCount > maxLines &&
        `Teksten har ${lineCount} linjer, men bare de ${maxLines} første kommer med i bildet.`
      }
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
