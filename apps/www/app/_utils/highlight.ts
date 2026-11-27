/** Mark every occurrence of `query` inside `scope` with the CSS Custom Highlight API. */
export const highlightText = (query: string, scope: HTMLElement) => {
  if (!query || !scope) return;

  // Not supported in older browsers
  if (!CSS.highlights) return;

  // Remove only search results, preserving syntax highlights.
  CSS.highlights.delete('custom-highlight');

  const str = query.trim().toLowerCase();
  if (!str) return;

  const ranges: Range[] = [];
  const treeWalker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);

  for (let node = treeWalker.nextNode(); node; node = treeWalker.nextNode()) {
    const text = node.textContent?.toLowerCase() ?? '';
    let index = text.indexOf(str);
    while (index !== -1) {
      const range = new Range();
      range.setStart(node, index);
      range.setEnd(node, index + str.length);
      ranges.push(range);
      index = text.indexOf(str, index + str.length);
    }
  }

  CSS.highlights.set('custom-highlight', new Highlight(...ranges));
};
