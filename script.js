import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bafpnqleaivhlbtbvufg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_dyg3P9bHZkwRn7_bErLySw_lGPgdGfc'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ===== NAVBAR AUTH STATE =====
async function updateNavbar() {
  const { data: { session } } = await supabase.auth.getSession();
  const navRight = document.querySelector(".nav-right");
  if (!navRight) return;

  if (session && session.user) {
    const user = session.user;
    const name = user.user_metadata?.full_name || user.email.split("@")[0];
    const initial = name.charAt(0).toUpperCase();

    navRight.innerHTML = `
      <button class="btn-ghost" id="search-btn" onclick="toggleSearch()"><i class="ti ti-search"></i></button>
      <div class="nav-user" id="nav-user-btn">
        <div class="nav-avatar">${initial}</div>
        <span class="nav-username">${name}</span>
        <i class="ti ti-chevron-down" style="font-size:13px;color:var(--text-muted)"></i>
      </div>
      <div class="nav-dropdown hidden" id="nav-dropdown">
        <a href="admin.html" class="nav-dd-item">
          <i class="ti ti-edit"></i> Write article
        </a>
        <div class="nav-dd-divider"></div>
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
      <button class="btn-primary" onclick="window.location.href='admin.html'">
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

// ESC key se search band karo
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlay = document.getElementById("search-overlay");
    if (overlay && !overlay.classList.contains("hidden")) toggleSearch();
  }
});

function handleSearch(query) {
  const results = document.getElementById("search-results");
  query = query.trim().toLowerCase();

  if (!query) {
    results.innerHTML = `
      <div class="search-empty">
        <i class="ti ti-search"></i>
        <span>Kuch likho — articles dhundhne ke liye</span>
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
        <span>"${query}" se koi article nahi mila</span>
      </div>
    `;
    return;
  }

  results.innerHTML = `
    <div class="search-count">${filtered.length} article${filtered.length > 1 ? 's' : ''} mile</div>
    ${filtered.map(p => `
      <div class="search-result-item" onclick="window.location.href='post.html?slug=${p.slug}'">
        <div class="sri-cat">${p.category}</div>
        <div class="sri-title">${highlightText(p.title, query)}</div>
        <div class="sri-meta">${p.author} · ${p.date}</div>
      </div>
    `).join('')}
  `;
}
window.handleSearch = handleSearch;

function highlightText(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ===== DATA =====
let posts = [];

async function loadPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) { console.error('Error loading posts:', error); return; }

  posts = data.map(p => ({
    id: p.id,
    slug: p.slug,
    cat: p.category ? p.category.toLowerCase().replace(/ /g, '-') : 'general',
    category: p.category || 'General',
    title: p.title,
    excerpt: p.excerpt || '',
    author: p.author_name || 'Anonymous',
    date: new Date(p.created_at).toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'}),
    read: '5 min'
  }));

  renderPosts();
}

loadPosts();

const trending = [
  "CGPA kaise improve karein — honest aur practical guide",
  "Programming seekhne ka sab se sahi tareeqa kya hai?",
  "Student scholarships — poori aur accurate information",
  "LinkedIn profile kaise banayein — CS students ke liye"
];

// ===== STATE =====
let activeCat = "all";
let visibleCount = 5;

// ===== RENDER POSTS =====
function renderPosts() {
  const list = document.getElementById("post-list");
  const filtered = activeCat === "all"
    ? posts
    : posts.filter(p => p.cat === activeCat);
  const visible = filtered.slice(0, visibleCount);

  list.innerHTML = "";

  visible.forEach((post, i) => {
    const item = document.createElement("div");
    item.className = "post-item";
    item.dataset.slug = post.slug;
    item.style.animationDelay = `${i * 0.06}s`;
    item.innerHTML = `
      <div>
        <div class="pi-tag">
          <span class="pi-cat">${post.category}</span>
          <span class="pi-sep"></span>
          <span>${post.author}</span>
          <span class="pi-sep"></span>
          <span>${post.date}</span>
          <span class="pi-sep"></span>
          <span><i class="ti ti-clock" style="font-size:11px"></i> ${post.read}</span>
        </div>
        <div class="pi-title">${post.title}</div>
        <div class="pi-excerpt">${post.excerpt}</div>
      </div>
      <div class="pi-num">${String(i + 1).padStart(2, "0")}</div>
    `;
    list.appendChild(item);
  });

  const btn = document.getElementById("load-more");
  btn.style.display = filtered.length > visibleCount ? "flex" : "none";
}

// ===== RENDER TRENDING =====
function renderTrending() {
  const list = document.getElementById("trending-list");
  list.innerHTML = trending.map((t, i) => `
    <div class="t-item">
      <div class="t-num">${String(i + 1).padStart(2, "0")}</div>
      <div class="t-text">${t}</div>
    </div>
  `).join("");
}

// ===== CATEGORY FILTER =====
document.querySelectorAll(".cat").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    visibleCount = 5;
    renderPosts();
  });
});

// ===== LOAD MORE =====
document.getElementById("load-more").addEventListener("click", () => {
  visibleCount += 3;
  renderPosts();
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll(".stat-num").forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = target >= 1000
        ? (current / 1000).toFixed(1) + "k"
        : Math.floor(current);
    }, 16);
  });
}

// ===== NEWSLETTER =====
function subscribe() {
  const email = document.getElementById("nl-email").value;
  if (!email || !email.includes("@")) {
    document.getElementById("nl-email").style.borderColor = "#ef4444";
    return;
  }
  document.getElementById("nl-success").style.display = "flex";
  document.getElementById("nl-email").style.display = "none";
  document.querySelector(".nl-btn").style.display = "none";
}
window.subscribe = subscribe;

// ===== INIT =====
renderPosts();
renderTrending();
animateCounters();

// ===== POST CLICK =====
document.getElementById("post-list").addEventListener("click", (e) => {
  const item = e.target.closest(".post-item");
  if (item && item.dataset.slug) {
    window.location.href = `post.html?slug=${item.dataset.slug}`;
  }
});

document.querySelector(".featured-card").addEventListener("click", () => {
  if (posts.length > 0) {
    window.location.href = `post.html?slug=${posts[0].slug}`;
  }
});
