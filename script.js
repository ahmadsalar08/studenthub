// ===== DATA =====
const posts = [
  {
    id: 1, cat: "study",
    category: "Study Tips",
    title: "Exams ki tayari — last minute strategy jo actually kaam kare",
    excerpt: "Raat ko 2 baje exam hai aur abhi padhai shuru nahi ki? Ghabrao mat — yeh scientific approach follow karo aur pass ho jao.",
    author: "Sara Ahmed", date: "18 May 2026", read: "5 min"
  },
  {
    id: 2, cat: "tech",
    category: "Tech & Tools",
    title: "Free tools jo har CS student ko pata hone chahiye — 2026 edition",
    excerpt: "GitHub, VS Code, Notion, Figma — sab free hain aur tumhari productivity double kar denge. Poori list yahan hai.",
    author: "Umar Sheikh", date: "15 May 2026", read: "6 min"
  },
  {
    id: 3, cat: "career",
    category: "Career",
    title: "2nd year mein internship kaise milti hai — honest guide",
    excerpt: "Portfolio, resume, aur cold emails — yeh sab cheezein hain jo internship dilwa sakti hain even without experience.",
    author: "Zara Malik", date: "12 May 2026", read: "7 min"
  },
  {
    id: 4, cat: "lifestyle",
    category: "Lifestyle",
    title: "Student life mein time management — balance kaise rakhen?",
    excerpt: "Studies, assignments, social life aur sleep — teeno ko ek saath manage karna possible hai agar sahi system ho.",
    author: "Hassan Raza", date: "10 May 2026", read: "4 min"
  },
  {
    id: 5, cat: "mental",
    category: "Mental Health",
    title: "CGPA anxiety — kab serious lein aur kab relax karein?",
    excerpt: "Grades important hain lekin yeh poori zindagi nahi. Ek honest aur helpful conversation about student mental health.",
    author: "Ayesha Khan", date: "8 May 2026", read: "5 min"
  },
  {
    id: 6, cat: "exams",
    category: "Exams",
    title: "MCQs mein guess work — sahi technique kya hai?",
    excerpt: "Elimination method se lekar probability tak — MCQ exams mein smart guessing bhi ek skill hai.",
    author: "Ali Raza", date: "5 May 2026", read: "3 min"
  },
  {
    id: 7, cat: "tech",
    category: "Tech & Tools",
    title: "Git aur GitHub — beginner se intermediate tak",
    excerpt: "Version control sirf bade developers ke liye nahi — 2nd semester se hi start karo aur portfolio banao.",
    author: "Bilal Ahmed", date: "2 May 2026", read: "8 min"
  },
  {
    id: 8, cat: "career",
    category: "Career",
    title: "LinkedIn profile kaise banayein — CS students ke liye",
    excerpt: "Profile picture se lekar about section tak — yeh guide follow karo aur recruiter ka dhyan attract karo.",
    author: "Sara Ahmed", date: "28 Apr 2026", read: "5 min"
  }
];

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