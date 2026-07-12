import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bafpnqleaivhlbtbvufg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_dyg3P9bHZkwRn7_bErLySw_lGPgdGfc'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CONFIG = {
  ADMIN_EMAIL: 'ahmadsalar4321@gmail.com',
  ANIMATION_DURATION_MS: 1800,
  ANIMATION_FRAME_MS: 16,
  LOAD_MORE_COUNT: 3,
  INITIAL_POST_COUNT: 5,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAX_EMAIL_LENGTH: 254
};

const CATEGORY_FILTERS = {
  study: 'Study Tips',
  tech: 'Tech & Tools',
  career: 'Career',
  exams: 'Exams',
  lifestyle: 'Lifestyle',
  mental: 'Mental Health'
};

function normalizeCategory(value) {
  return (value || '').trim().replace(/\s+/g, ' ');
}

function getCategorySlug(category) {
  const normalized = normalizeCategory(category);
  if (!normalized) return 'general';
  for (const [slug, label] of Object.entries(CATEGORY_FILTERS)) {
    if (normalized.toLowerCase() === label.toLowerCase()) return slug;
  }
  return 'general';
}

function postMatchesCategory(post, filterSlug) {
  if (filterSlug === 'all') return true;
  return getCategorySlug(post.category) === filterSlug;
}

// ===== READ TIME ESTIMATE =====
function estimateReadTime(content) {
  if (!content) return '1 min';
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

// ===== NAVBAR AUTH STATE =====
async function updateNavbar() {
  const { data: { session } } = await supabase.auth.getSession();
  const navRight = document.querySelector(".nav-right");
  if (!navRight) return;

  if (session && session.user) {
    const user = session.user;
    const name = user.user_metadata?.full_name || user.email.split("@")[0];
    const initial = name.charAt(0).toUpperCase();
    const isAdmin = user.email === CONFIG.ADMIN_EMAIL;

    navRight.innerHTML = `
      <button class="btn-ghost" id="search-btn" onclick="toggleSearch()"><i class="ti ti-search"></i></button>
      <div class="nav-user" id="nav-user-btn">
        <div class="nav-avatar">${initial}</div>
        <span class="nav-username">${name}</span>
        <i class="ti ti-chevron-down" style="font-size:13px;color:var(--text-muted)"></i>
      </div>
      <div class="nav-dropdown hidden" id="nav-dropdown">
        ${isAdmin ? `
          <a href="admin.html" class="nav-dd-item">
            <i class="ti ti-edit"></i> Write article
          </a>
          <div class="nav-dd-divider"></div>
        ` : ''}
        <button class="nav-dd-item nav-dd-logout" id="logout-btn">
          <i class="ti ti-logout"></i> Sign out
        </button>
      </div>
    `;

    document.getElementById("nav-user-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      document.getElementById("nav-dropdown").classList.toggle("show");
    });
    document.addEventListener("click", () => {
      const dd = document.getElementById("nav-dropdown");
      if (dd) dd.classList.add("hidden");
    });
    document.getElementById("logout-btn").addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });

  } else {
    navRight.innerHTML = `
      <button class="btn-ghost" id="search-btn" onclick="toggleSearch()"><i class="ti ti-search"></i></button>
      <button class="btn-ghost" onclick="window.location.href='login.html'">Sign in</button>
      <button class="btn-primary" onclick="guardedWrite()">
        <i class="ti ti-edit"></i> Write
      </button>
    `;
  }
}

updateNavbar();

// ===== SEARCH =====
function toggleSearch() {
  const overlay = document.getElementById("search-overlay");
  overlay.classList.toggle("hidden");
  if (!overlay.classList.contains("hidden")) {
    setTimeout(() => document.getElementById("search-input").focus(), 100);
  }
}
window.toggleSearch = toggleSearch;

function closeSearch(e) {
  if (e.target.id === "search-overlay") toggleSearch();
}
window.closeSearch = closeSearch;

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlay = document.getElementById("search-overlay");
    if (overlay && !overlay.classList.contains("hidden")) toggleSearch();
  }
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
  if (!query || !text) return text;
  try {
    const escapedQuery = escapeRegex(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  } catch (err) {
    return text;
  }
}

function handleSearch(query) {
  const results = document.getElementById("search-results");
  query = query.trim().toLowerCase();

  if (!query) {
    results.innerHTML = `
      <div class="search-empty">
        <i class="ti ti-search"></i>
        <span>Type something — to search articles</span>
      </div>
    `;
    return;
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.excerpt.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    p.author.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    results.innerHTML = `
      <div class="search-empty">
        <i class="ti ti-mood-sad"></i>
        <span>No article found for "${DOMPurify.sanitize(query)}"</span>
      </div>
    `;
    return;
  }

  try {
    results.innerHTML = DOMPurify.sanitize(`
      <div class="search-count">${filtered.length} article${filtered.length > 1 ? 's' : ''} found</div>
      ${filtered.map(p => `
        <div class="search-result-item" data-slug="${escapeHtml(p.slug)}">
          <div class="sri-cat">${escapeHtml(p.category)}</div>
          <div class="sri-title">${highlightText(p.title, query)}</div>
          <div class="sri-meta">${escapeHtml(p.author)} · ${escapeHtml(p.date)}</div>
        </div>
      `).join('')}
    `);

    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const slug = item.dataset.slug;
        if (slug) window.location.href = `post.html?slug=${encodeURIComponent(slug)}`;
      });
    });
  } catch (err) {
    results.innerHTML = `
      <div class="search-empty">
        <i class="ti ti-alert-circle"></i>
        <span>Search error. Please try again.</span>
      </div>
    `;
  }
}
window.handleSearch = handleSearch;

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== DATA =====
let posts = [];

// ===== LOAD REAL STATS FROM DB =====
async function loadRealStats() {
  try {
    // Real post count
    const { count: postCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    // Total views
    const { data: viewsData } = await supabase
      .from('posts')
      .select('views')
      .eq('published', true)

    const totalViews = viewsData
      ? viewsData.reduce((sum, p) => sum + (p.views || 0), 0)
      : 0

    // Update hero stats
    const statNums = document.querySelectorAll('.stat-num')
    if (statNums[0]) {
      statNums[0].dataset.target = totalViews
      statNums[0].closest('.hero-stat')?.querySelector('.stat-label') &&
        (statNums[0].closest('.hero-stat').querySelector('.stat-label').textContent = 'Total views')
    }
    if (statNums[1]) {
      statNums[1].dataset.target = postCount || 0
      statNums[1].closest('.hero-stat')?.querySelector('.stat-label') &&
        (statNums[1].closest('.hero-stat').querySelector('.stat-label').textContent = 'Articles published')
    }

    // Re-run counter animation with real data
    animateCounters()

    // Update dashboard card
    const dbMetrics = document.querySelectorAll('.db-metric-val')
    if (dbMetrics[1]) dbMetrics[1].textContent = postCount || 0

  } catch (err) {
    console.error('Stats load error:', err)
  }
}

// ===== LOAD FEATURED POST FROM DB =====
async function loadFeaturedPost() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return

    const readTime = estimateReadTime(data.content)
    const date = new Date(data.created_at).toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    const excerpt = data.excerpt ||
      (data.content ? data.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '')

    const fc = document.querySelector('.featured-card')
    if (!fc) return

    fc.querySelector('.fc-meta')?.parentElement &&
      (() => {
        const metas = fc.querySelectorAll('.fc-meta')
        if (metas[0]) metas[0].textContent = date
        if (metas[1]) metas[1].innerHTML = `<i class="ti ti-clock"></i> ${readTime} read`
      })()

    const titleEl = fc.querySelector('.fc-title')
    if (titleEl) titleEl.textContent = data.title

    const excerptEl = fc.querySelector('.fc-excerpt')
    if (excerptEl) excerptEl.textContent = excerpt

    const authorEl = fc.querySelector('.fc-author')
    if (authorEl) authorEl.innerHTML = `${escapeHtml(data.author_name || 'Anonymous')} <span class="dot">·</span> ${escapeHtml(data.category || 'General')}`

    const avatarEl = fc.querySelector('.fc-avatar')
    if (avatarEl) avatarEl.textContent = (data.author_name || 'A').charAt(0).toUpperCase()

    fc.dataset.slug = data.slug
    fc.style.cursor = 'pointer'
    fc.onclick = () => window.location.href = `post.html?slug=${encodeURIComponent(data.slug)}`

  } catch (err) {
    console.error('Featured post error:', err)
  }
}

async function loadPosts() {
  const postList = document.getElementById("post-list");

  if (postList) {
    postList.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:var(--text-muted)">
        <i class="ti ti-loader" style="font-size:24px;margin-bottom:12px;display:block;animation:spin 1s linear infinite"></i>
        Loading articles...
      </div>
    `;
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      if (postList) {
        postList.innerHTML = `
          <div style="text-align:center;padding:48px 20px;color:#ef4444">
            <i class="ti ti-alert-circle" style="font-size:32px;margin-bottom:12px;display:block"></i>
            Failed to load articles. Please refresh the page.
          </div>
        `;
      }
      return;
    }

    posts = data.map(p => ({
      id: p.id,
      slug: p.slug,
      cat: getCategorySlug(p.category),
      category: p.category || 'General',
      title: p.title,
      excerpt: p.excerpt || '',
      author: p.author_name || 'Anonymous',
      date: new Date(p.created_at).toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'}),
      read: estimateReadTime(p.content)
    }));

    renderPosts();
  } catch (err) {
    if (postList) {
      postList.innerHTML = `
        <div style="text-align:center;padding:48px 20px;color:#ef4444">
          <i class="ti ti-alert-circle" style="font-size:32px;margin-bottom:12px;display:block"></i>
          An unexpected error occurred. Please refresh the page.
        </div>
      `;
    }
  }
}

const trending = [
  "How to improve your CGPA — an honest and practical guide",
  "What is the best way to learn programming?",
  "Student scholarships — complete and accurate information",
  "How to build your LinkedIn profile — for CS students"
];

let activeCat = "all";
let visibleCount = CONFIG.INITIAL_POST_COUNT;

function renderPosts() {
  const list = document.getElementById("post-list");
  const filtered = activeCat === "all"
    ? posts
    : posts.filter(p => postMatchesCategory(p, activeCat));
  const visible = filtered.slice(0, visibleCount);

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:var(--text-muted)">
        <i class="ti ti-article-off" style="font-size:32px;margin-bottom:12px;display:block"></i>
        No articles yet. Check back soon!
      </div>
    `;
    return;
  }

  visible.forEach((post, i) => {
    const item = document.createElement("div");
    item.className = "post-item";
    item.dataset.slug = post.slug;
    item.style.animationDelay = `${i * 0.06}s`;
    item.innerHTML = `
      <div>
        <div class="pi-tag">
          <span class="pi-cat">${escapeHtml(post.category)}</span>
          <span class="pi-sep"></span>
          <span>${escapeHtml(post.author)}</span>
          <span class="pi-sep"></span>
          <span>${escapeHtml(post.date)}</span>
          <span class="pi-sep"></span>
          <span><i class="ti ti-clock" style="font-size:11px"></i> ${escapeHtml(post.read)}</span>
        </div>
        <div class="pi-title">${escapeHtml(post.title)}</div>
        <div class="pi-excerpt">${escapeHtml(post.excerpt)}</div>
      </div>
      <div class="pi-num">${String(i + 1).padStart(2, "0")}</div>
    `;
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      window.location.href = `post.html?slug=${encodeURIComponent(post.slug)}`;
    });
    list.appendChild(item);
  });

  const btn = document.getElementById("load-more");
  if (btn) btn.style.display = filtered.length > visibleCount ? "flex" : "none";
}

function renderTrending() {
  const list = document.getElementById("trending-list");
  if (!list) return;
  list.innerHTML = trending.map((t, i) => `
    <div class="t-item">
      <div class="t-num">${String(i + 1).padStart(2, "0")}</div>
      <div class="t-text">${escapeHtml(t)}</div>
    </div>
  `).join("");
}

document.querySelectorAll(".cat").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    visibleCount = CONFIG.INITIAL_POST_COUNT;
    renderPosts();
  });
});

document.getElementById("load-more")?.addEventListener("click", () => {
  visibleCount += CONFIG.LOAD_MORE_COUNT;
  renderPosts();
});

function animateCounters() {
  document.querySelectorAll(".stat-num").forEach(el => {
    const target = parseInt(el.dataset.target) || 0;
    if (!target) return;
    const step = target / (CONFIG.ANIMATION_DURATION_MS / CONFIG.ANIMATION_FRAME_MS);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = target >= 1000
        ? (current / 1000).toFixed(1) + "k"
        : Math.floor(current);
    }, CONFIG.ANIMATION_FRAME_MS);
  });
}

function isValidEmail(email) {
  return CONFIG.EMAIL_REGEX.test(email) &&
         email.length <= CONFIG.MAX_EMAIL_LENGTH &&
         email.length >= 3;
}

async function subscribe() {
  const emailInput = document.getElementById("nl-email");
  const email = emailInput.value.trim();
  const successEl = document.getElementById("nl-success");

  emailInput.style.borderColor = "";
  successEl.style.display = "none";

  if (!isValidEmail(email)) {
    emailInput.style.borderColor = "#ef4444";
    successEl.style.display = "flex";
    successEl.innerHTML = '<i class="ti ti-alert-circle"></i> Please enter a valid email address.';
    return;
  }

  try {
    const { error } = await supabase.from('newsletters').insert({ email });

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        successEl.style.display = "flex";
        successEl.innerHTML = '<i class="ti ti-info-circle"></i> You\'re already subscribed!';
      } else {
        emailInput.style.borderColor = "#ef4444";
        successEl.style.display = "flex";
        successEl.innerHTML = '<i class="ti ti-alert-circle"></i> Subscription failed. Please try again.';
      }
      return;
    }

    successEl.style.display = "flex";
    successEl.innerHTML = '<i class="ti ti-check-circle" style="color:#22c55e"></i> Thanks for subscribing!';
    emailInput.style.display = "none";
    document.querySelector(".nl-btn").style.display = "none";
  } catch (err) {
    emailInput.style.borderColor = "#ef4444";
    successEl.style.display = "flex";
    successEl.innerHTML = '<i class="ti ti-alert-circle"></i> An unexpected error occurred.';
  }
}
window.subscribe = subscribe;

async function guardedWrite() {
  const { data: { session } } = await supabase.auth.getSession();
  window.location.href = session ? 'admin.html' : 'login.html';
}
window.guardedWrite = guardedWrite;

function handleUrlFilter() {
  const params = new URLSearchParams(window.location.search)
  const cat = params.get('cat')
  if (cat) {
    const btn = document.querySelector(`.cat[data-cat="${cat}"]`)
    if (btn) {
      document.querySelectorAll('.cat').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      activeCat = cat
      renderPosts()
      document.querySelector('.cats-bar')?.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// ===== INIT =====
renderTrending();
animateCounters();
loadPosts().then(() => handleUrlFilter());
loadRealStats();
loadFeaturedPost();

// ===== CSS ANIMATION =====
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);