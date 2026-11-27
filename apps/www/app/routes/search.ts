import { data } from 'react-router';
import { getProfile } from '~/_config/profiles';
import { getSearchIndex, searchIndex } from '~/_utils/search-index.server';
import type { Route } from './+types/search';

/** `/api/search?q=<query>&profile=<slug>` – leave out `profile` to search all. */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const profile = getProfile(url.searchParams.get('profile') || undefined);

  if (!query.trim()) {
    return data({ results: [], query: '' });
  }

  const index = getSearchIndex();
  const results = searchIndex(index, query, profile?.slug, 15);

  return data({
    results: results.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      category: item.category,
      profile: item.profile,
    })),
    query,
  });
};
