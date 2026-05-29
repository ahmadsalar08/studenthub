// Supabase Setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bafpnqleaivhlbtbvufg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_dyg3P9bHZkwRn7_bErLySw_lGPgdGfc'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ===== DATA =====
let posts = [];

async function loadPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading posts:', error);
    return;
  }

  posts = data.map(p => ({
    id: p.id,
    cat: p.category ? p.category.toLowerCase() : 'general',
    category: p.category || 'General',
    title: p.title,
    excerpt: p.excerpt || '',
    author: p.author_name || 'Anonymous',
    date: new Date(p.created_at).toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'}),
    read: '5 min'
  }));

  renderPosts();
  renderFeatured();
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

  // Load more button hide/show
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
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
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

// ===== INIT =====
renderPosts();
renderTrending();
animateCounters();

// Post click hone par post.html kholo
document.getElementById("post-list").addEventListener("click", (e) => {
  const item = e.target.closest(".post-item");
  if (item) window.location.href = "post.html";
});

document.querySelector(".featured-card").addEventListener("click", () => {
  window.location.href = "post.html";
});