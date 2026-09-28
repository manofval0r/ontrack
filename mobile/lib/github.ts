/** GitHub REST helpers — called with the user's own OAuth token (SecureStore).
 * Powers the integration detail screen: repos, commits, PR/issue counts. */
const GH = 'https://api.github.com';

async function gh<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GH}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    throw { error: `GitHub rejected the request (HTTP ${res.status}). Reconnect.`, code: 'GITHUB_ERROR' };
  }
  return res.json() as Promise<T>;
}

export interface GhRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  updated_at: string;
}

export interface GhCommit {
  sha: string;
  commit: { message: string; author?: { date?: string; name?: string } };
}

export async function listRepos(token: string): Promise<GhRepo[]> {
  return gh<GhRepo[]>('/user/repos?per_page=10&sort=updated', token);
}

export async function recentCommits(token: string, repo: string, sinceDays = 7): Promise<GhCommit[]> {
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
  return gh<GhCommit[]>(`/repos/${repo}/commits?since=${encodeURIComponent(since)}&per_page=20`, token);
}

export async function openCounts(token: string, repo: string): Promise<{ prs: number; issues: number }> {
  const [prs, issues] = await Promise.all([
    gh<any[]>(`/repos/${repo}/pulls?state=open&per_page=1`, token).catch(() => [] as any[]),
    gh<any[]>(`/repos/${repo}/issues?state=open&per_page=1`, token).catch(() => [] as any[]),
  ]);
  return { prs: prs.length, issues: issues.filter((i) => !i.pull_request).length };
}
