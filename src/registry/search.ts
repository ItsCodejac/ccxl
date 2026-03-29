import type { SearchResult } from './types.js';

export async function searchPackages(query: string): Promise<SearchResult[]> {
  const searchQuery = encodeURIComponent(`${query} topic:ccxl-package`);
  const url = `https://api.github.com/search/repositories?q=${searchQuery}&sort=stars&per_page=20`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'ccxl' },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN for higher limits.');
    }
    throw new Error(`GitHub search failed: ${response.status}`);
  }

  const data = await response.json() as {
    items: Array<{
      name: string;
      full_name: string;
      description: string | null;
      stargazers_count: number;
      html_url: string;
    }>;
  };

  return data.items.map((item) => ({
    name: item.name,
    fullName: item.full_name,
    description: item.description ?? '',
    stars: item.stargazers_count,
    url: item.html_url,
  }));
}
