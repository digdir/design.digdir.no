import { useEffect } from 'react';

/** Whether a DOM change added a code block or changed the text of one. */
const touchesCodeBlock = (mutation: MutationRecord) => {
  const target =
    mutation.target instanceof Element
      ? mutation.target
      : mutation.target.parentElement;
  if (target?.closest('pre')) return true;

  for (const node of mutation.addedNodes) {
    if (
      node instanceof Element &&
      (node.matches('pre') || node.querySelector('pre'))
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Syntax-highlight every `<pre><code class="language-…">` on the site with
 * MicroLighter. It colours the code through the CSS Custom Highlight API, so
 * the markup stays plain text – no `<span>` per token, and nothing for React
 * to hydrate. The colours come from the theme loaded in `root.tsx`.
 *
 * Call it once, at the root. It highlights the page, and again whenever a
 * code block is added or its text changes (navigation, dialogs, snippets that
 * follow a control). Each run redoes the whole page, since MicroLighter
 * replaces its previous highlights.
 */
export const useSyntaxHighlight = () => {
  useEffect(() => {
    // Browsers without the API just show the code without colours.
    if (!('highlights' in CSS)) return;

    let frame = 0;
    // Runs wait for each other, so an older one never finishes last and
    // leaves highlights for code blocks that are gone.
    let queue = Promise.resolve();
    const highlight = () => {
      frame = 0;
      queue = queue
        // Loaded on demand, like the grammars it then imports per language.
        .then(() => import('microlighter'))
        .then(({ highlightAll }) => highlightAll())
        .then(
          () => undefined,
          (error) => console.warn('Could not highlight code', error),
        );
    };
    // Highlighting does not change the DOM, so this cannot loop.
    const observer = new MutationObserver((mutations) => {
      if (frame === 0 && mutations.some(touchesCodeBlock)) {
        frame = requestAnimationFrame(highlight);
      }
    });

    highlight();
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
};
