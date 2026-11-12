'use client';
import {
  Button,
  type ButtonProps,
  Input,
  type InputProps,
} from '@digdir/designsystemet-react';
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
} from 'react';

/*
 * Search for the digdir profile.
 *
 * See: https://designsystemet.no/no/blog/search-is-being-removed-what-should-you-do
 */

export type SearchProps = HTMLAttributes<HTMLDivElement>;

const SearchRoot = forwardRef<HTMLDivElement, SearchProps>(function Search(
  { className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['dd-search', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
});

export type SearchInputProps = Omit<InputProps, 'type'> & {
  /**
   * `search` shows the magnifying glass and is announced as a search field.
   * Use `text` to hide the magnifying glass.
   * @default 'search'
   */
  type?: 'search' | 'text';
};

/**
 * The search field. Give it a name with a `Label` or `aria-label`.
 *
 * @example
 * <Search>
 *   <SearchInput aria-label='Søk' />
 * </Search>
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      type = 'search',
      // Shows a search key on mobile keyboards.
      enterKeyHint = 'search',
      // `SearchClear` is only shown while the placeholder is hidden, so the
      // field needs one even when no placeholder text is wanted.
      placeholder = ' ',
      ...rest
    },
    ref,
  ) {
    return (
      <Input
        ref={ref}
        type={type}
        enterKeyHint={enterKeyHint}
        placeholder={placeholder}
        {...rest}
      />
    );
  },
);

/** Set an input's value the way typing does, so React's `onChange` fires. */
const setInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

export type SearchClearProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> & {
  /**
   * Name of the button – it only shows an icon.
   * @default 'Tøm'
   */
  'aria-label'?: string;
};

/**
 * Button that empties the search field. Shown when the field has a value.
 *
 * @example
 * <Search>
 *   <SearchInput aria-label='Søk' />
 *   <SearchClear />
 * </Search>
 */
export const SearchClear = forwardRef<HTMLButtonElement, SearchClearProps>(
  function SearchClear({ 'aria-label': label = 'Tøm', onClick, ...rest }, ref) {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      const input = event.currentTarget
        .closest('.dd-search')
        ?.querySelector('input');
      if (!input) return;

      // Stop the reset, which would also empty every other field in the form.
      event.preventDefault();
      setInputValue(input, '');
      input.focus();
    };

    return (
      <button
        ref={ref}
        // A real reset button, so it works in a `<form>` before hydration.
        type='reset'
        aria-label={label}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);

export type SearchButtonProps = Omit<ButtonProps, 'variant'> & {
  /** @default 'primary' */
  variant?: 'primary' | 'secondary';
};

/**
 * Button that submits the search, joined to the search field.
 *
 * @example
 * <Search>
 *   <SearchInput aria-label='Søk' />
 *   <SearchButton>Søk</SearchButton>
 * </Search>
 */
export const SearchButton = forwardRef<HTMLButtonElement, SearchButtonProps>(
  function SearchButton({ children = 'Søk', ...rest }, ref) {
    return (
      <Button ref={ref} type='submit' {...rest}>
        {children}
      </Button>
    );
  },
);

/**
 * A search field with an optional clear button and search button. Wrap it in
 * a `<form>` to submit the search.
 *
 * @example with search button
 * <Search>
 *   <Search.Input aria-label='Søk' />
 *   <Search.Clear />
 *   <Search.Button />
 * </Search>
 *
 * @example with icon only
 * <Search>
 *   <Search.Input aria-label='Søk' />
 *   <Search.Clear />
 * </Search>
 */
export const Search = Object.assign(SearchRoot, {
  Input: SearchInput,
  Clear: SearchClear,
  Button: SearchButton,
});

Search.Input.displayName = 'Search.Input';
Search.Clear.displayName = 'Search.Clear';
Search.Button.displayName = 'Search.Button';
