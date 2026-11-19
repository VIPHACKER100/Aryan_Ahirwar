import { initTiltCards } from './tilt.js';

/**
 * Safe, Zero-XSS GitHub Repositories Command Deck:
 * - Zero innerHTML: builds every card strictly via DOM nodes & textContent
 * - Validates https:// URLs before assigning href
 * - Unified category resolution between filter & badge
 * - 30-minute localStorage TTL cache + AbortSignal.timeout(6000)
 * - Immediate curated snapshot render (0 CLS), then seamless live hydration
 */
const CACHE_KEY = 'vh_github_cache_v2';
const CACHE_TTL_MS = 30 * 60 * 1000;
const INITIAL_VISIBLE_LIMIT = 9;

function isSafeHttpsUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function createSvgIcon(paths, size = 14, stroke = 'currentColor', fill = 'none') {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', fill);
  svg.setAttribute('stroke', stroke);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  paths.forEach(({ tag, attrs }) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    svg.appendChild(el);
  });
  return svg;
}

export function initReposDeck(profile) {
  const container = document.getElementById('repos-container');
  const syncStatus = document.getElementById('repo-sync-status');
  const searchInput = document.getElementById('repo-search-input');
  const sortSelect = document.getElementById('repo-sort-select');
  const filterBtns = document.querySelectorAll('#project-filters .filter-btn');
  const showMoreBtn = document.getElementById('repo-show-more');
  const showMoreWrap = document.getElementById('repo-show-more-wrap');
  const resultsLive = document.getElementById('repo-results-live');

  if (!container) return;

  const { blockList, featuredOrder, descriptions, categoryMap, fallback } = profile.repos;
  const blockSet = new Set(blockList);
  const featuredRank = new Map(featuredOrder.map((name, idx) => [name, idx]));

  let currentRepoList = [...fallback];
  let currentFilter = 'all';
  let currentSearch = '';
  let currentSort = 'featured';
  let showAll = false;

  // Single unified category resolver used by BOTH filtering and badge rendering
  function getRepoCategory(repo) {
    if (Object.hasOwn(categoryMap, repo.name)) {
      return categoryMap[repo.name];
    }
    const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
    if (/(osint|recon|dork|subdomain|spider|enum)/.test(text)) return 'recon';
    if (/(ai|llm|ml|phish|vision|agent|neural|gpt)/.test(text)) return 'ai';
    return 'tools';
  }

  function setStatusText(prefix, highlightText, highlightColor, suffix) {
    if (!syncStatus) return;
    const badge = document.createElement('span');
    badge.style.color = highlightColor;
    badge.textContent = highlightText;
    syncStatus.replaceChildren(
      document.createTextNode(`${prefix} `),
      badge,
      document.createTextNode(` • ${suffix}`)
    );
  }

  function buildRepoCard(repo) {
    const category = getRepoCategory(repo);
    const desc =
      repo.description ||
      descriptions[repo.name] ||
      'Security engineering module built by VIPHACKER.100.';
    const lang = repo.language || 'Code';
    const stars = Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0;
    const isFeatured = featuredRank.has(repo.name);
    const safeUrl = isSafeHttpsUrl(repo.html_url)
      ? repo.html_url
      : `https://github.com/${profile.identity.githubUser}`;

    const card = document.createElement('article');
    card.className = 'surface-card tilt-card repo-card';
    card.dataset.category = category;

    // Top block
    const top = document.createElement('div');
    top.className = 'repo-card-top';

    const header = document.createElement('div');
    header.className = 'repo-card-header';

    const title = document.createElement('h3');
    title.className = 'repo-title';
    title.appendChild(
      createSvgIcon(
        [
          { tag: 'path', attrs: { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' } },
          {
            tag: 'path',
            attrs: { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' },
          },
        ],
        16,
        'var(--cyber-emerald)'
      )
    );
    title.appendChild(document.createTextNode(repo.name));

    if (isFeatured && !repo.fork) {
      const fBadge = document.createElement('span');
      fBadge.className = 'repo-badge featured-badge';
      fBadge.textContent = 'FLAGSHIP';
      title.appendChild(fBadge);
    } else if (repo.fork) {
      const forkBadge = document.createElement('span');
      forkBadge.className = 'repo-badge';
      forkBadge.textContent = 'FORK';
      title.appendChild(forkBadge);
    }

    const starsEl = document.createElement('span');
    starsEl.className = 'repo-stars';
    starsEl.setAttribute('aria-label', `${stars} GitHub stars`);
    starsEl.appendChild(
      createSvgIcon(
        [
          {
            tag: 'polygon',
            attrs: {
              points:
                '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
            },
          },
        ],
        13,
        'none',
        'currentColor'
      )
    );
    starsEl.appendChild(document.createTextNode(String(stars)));

    header.append(title, starsEl);

    const descEl = document.createElement('p');
    descEl.className = 'repo-desc';
    descEl.textContent = desc;

    top.append(header, descEl);

    // Bottom block
    const bottom = document.createElement('div');
    bottom.className = 'repo-card-bottom';

    const tags = document.createElement('div');
    tags.className = 'repo-tags';
    [lang, category.toUpperCase(), 'VIPHACKER.100'].forEach((tagText) => {
      const tag = document.createElement('span');
      tag.className = 'repo-tag';
      tag.textContent = tagText;
      tags.appendChild(tag);
    });

    const linksRow = document.createElement('div');
    linksRow.className = 'repo-links';

    const link = document.createElement('a');
    link.href = safeUrl;
    link.className = 'repo-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const linkText = document.createElement('span');
    linkText.textContent = 'Access Source';
    const srContext = document.createElement('span');
    srContext.className = 'visually-hidden';
    srContext.textContent = ` for ${repo.name} on GitHub`;
    link.append(
      linkText,
      srContext,
      createSvgIcon([
        { tag: 'line', attrs: { x1: 7, y1: 17, x2: 17, y2: 7 } },
        { tag: 'polyline', attrs: { points: '7 7 17 7 17 17' } },
      ])
    );

    linksRow.appendChild(link);
    bottom.append(tags, linksRow);
    card.append(top, bottom);
    return card;
  }

  function renderRepos(announceCount = false) {
    const query = currentSearch.trim().toLowerCase();
    const filtered = currentRepoList.filter((repo) => {
      if (currentFilter !== 'all' && getRepoCategory(repo) !== currentFilter) {
        return false;
      }
      if (!query) return true;
      const desc = (repo.description || descriptions[repo.name] || '').toLowerCase();
      const lang = (repo.language || '').toLowerCase();
      return (
        repo.name.toLowerCase().includes(query) ||
        desc.includes(query) ||
        lang.includes(query)
      );
    });

    const sorted = filtered.toSorted((a, b) => {
      if (currentSort === 'stars') {
        return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      }
      if (currentSort === 'updated') {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      }
      // Default: featured flagship order first, then stars, then updated date
      const rankA = featuredRank.has(a.name) ? featuredRank.get(a.name) : 999;
      const rankB = featuredRank.has(b.name) ? featuredRank.get(b.name) : 999;
      if (rankA !== rankB) return rankA - rankB;
      const starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (starDiff !== 0) return starDiff;
      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    });

    if (sorted.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'surface-card';
      emptyCard.style.gridColumn = '1 / -1';
      emptyCard.style.textAlign = 'center';
      emptyCard.style.padding = '36px';

      const heading = document.createElement('div');
      heading.style.color = 'var(--cyber-amber)';
      heading.style.fontFamily = 'var(--font-mono)';
      heading.style.fontSize = '15px';
      heading.style.marginBottom = '8px';
      heading.textContent = '[!] No matching security modules found';

      const hint = document.createElement('div');
      hint.style.color = 'var(--text-dim)';
      hint.style.fontSize = '14px';
      hint.textContent = 'Try clearing your search query or switching categories.';

      emptyCard.append(heading, hint);
      container.replaceChildren(emptyCard);
      if (showMoreWrap) showMoreWrap.hidden = true;
      if (announceCount && resultsLive) {
        resultsLive.textContent = '0 repositories matched your filter.';
      }
      return;
    }

    const visible = showAll || query ? sorted : sorted.slice(0, INITIAL_VISIBLE_LIMIT);
    const fragment = document.createDocumentFragment();
    visible.forEach((repo) => fragment.appendChild(buildRepoCard(repo)));
    container.replaceChildren(fragment);

    if (showMoreWrap && showMoreBtn) {
      const hasMore = !query && sorted.length > INITIAL_VISIBLE_LIMIT;
      showMoreWrap.hidden = !hasMore;
      if (hasMore) {
        showMoreBtn.textContent = showAll
          ? `Show Flagship View (${INITIAL_VISIBLE_LIMIT})`
          : `Show All ${sorted.length} Modules`;
      }
    }

    if (announceCount && resultsLive) {
      resultsLive.textContent = `Showing ${visible.length} of ${sorted.length} repositories.`;
    }

    initTiltCards(container);
  }

  function applyTelemetryStats(userData, repoList) {
    const elRepos = document.getElementById('stat-repos');
    const elStars = document.getElementById('stat-stars');
    const elFollowers = document.getElementById('stat-followers');

    const totalStars = repoList.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    if (elRepos) {
      elRepos.textContent = userData?.public_repos != null ? String(userData.public_repos) : `${repoList.length}+`;
    }
    if (elStars) {
      elStars.textContent = totalStars > 0 ? String(totalStars) : '8+';
    }
    if (elFollowers) {
      elFollowers.textContent = userData?.followers != null ? String(userData.followers) : '15+';
    }
  }

  // Controls binding
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      showAll = false;
      renderRepos(true);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      currentSearch = event.target.value;
      renderRepos(true);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
      currentSort = event.target.value;
      renderRepos(true);
    });
  }

  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
      showAll = !showAll;
      renderRepos(true);
    });
  }

  // Render curated flagship snapshot immediately for 0.00 CLS
  applyTelemetryStats(null, currentRepoList);
  renderRepos(false);
  setStatusText('[*]', 'CURATED SNAPSHOT', 'var(--cyber-cyan)', 'Syncing live GitHub metrics...');

  // Check fresh localStorage cache first
  try {
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.savedAt < CACHE_TTL_MS && Array.isArray(cached.repos)) {
        currentRepoList = cached.repos;
        applyTelemetryStats(cached.user, currentRepoList);
        renderRepos(false);
        setStatusText(
          '[+]',
          'CACHED LIVE SYNC',
          'var(--cyber-emerald)',
          `${currentRepoList.length} modules • api.github.com`
        );
        return;
      }
    }
  } catch {
    // Ignore storage access errors
  }

  // Fetch live GitHub data with AbortSignal.timeout
  const user = encodeURIComponent(profile.identity.githubUser);
  const fetchJson = async (url) => {
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return res.json();
  };

  Promise.all([
    fetchJson(`https://api.github.com/users/${user}`).catch(() => null),
    fetchJson(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`).catch(() => null),
  ]).then(([userData, repoData]) => {
    if (Array.isArray(repoData) && repoData.length > 0) {
      const cleaned = repoData
        .filter((r) => !blockSet.has(r.name))
        .map((r) => ({
          name: r.name,
          description: r.description,
          html_url: r.html_url,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          language: r.language,
          fork: Boolean(r.fork),
          updated_at: r.updated_at,
        }));

      currentRepoList = cleaned;
      applyTelemetryStats(userData, currentRepoList);
      renderRepos(false);
      setStatusText(
        '[+]',
        'LIVE SYNC ACTIVE',
        'var(--cyber-emerald)',
        `${cleaned.length} modules • ${new Date().toLocaleTimeString()} • api.github.com`
      );

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ savedAt: Date.now(), user: userData, repos: cleaned })
        );
      } catch {
        // Quota or private browsing mode
      }
    } else {
      applyTelemetryStats(userData, currentRepoList);
      setStatusText(
        '[*]',
        'OFFLINE SNAPSHOT',
        'var(--cyber-amber)',
        'Verified Flagship Catalog (GitHub API rate-limited or offline)'
      );
    }
  });
}
