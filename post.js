// ===== READING PROGRESS =====
window.addEventListener("scroll", () => {
  const article = document.querySelector(".art-content");
  const bar = document.getElementById("progress-bar");
  if (!article || !bar) return;
  const rect = article.getBoundingClientRect();
  const total = article.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  const pct = Math.min(Math.max((scrolled / total) * 100, 0), 100);
  bar.style.width = pct + "%";
});

// ===== LIKE TOGGLE =====
let liked = false;
let likeCount = 124;

function toggleLike() {
  liked = !liked;
  likeCount = liked ? likeCount + 1 : likeCount - 1;
  document.getElementById("like-count").textContent = likeCount;
  document.getElementById("like-count-2").textContent = likeCount;
  const likeBtn = document.getElementById("like-btn");
  const likeBigBtn = document.getElementById("like-big-btn");
  likeBtn.classList.toggle("liked", liked);
  likeBigBtn.style.background = liked ? "var(--purple)" : "var(--purple-dim)";
  likeBigBtn.style.color = liked ? "#fff" : "var(--purple-light)";
}

// ===== COPY LINK =====
function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  const btn = document.querySelector('[onclick="copyLink()"]');
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="ti ti-check"></i>';
  btn.style.color = "#4ade80";
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.color = "";
  }, 2000);
}

// ===== ADD COMMENT =====
let commentCount = 3;

function addComment() {
  const input = document.getElementById("comment-input");
  const text = input.value.trim();
  if (!text) return;

  commentCount++;
  document.querySelector(".comments-count").textContent = commentCount;

  const list = document.getElementById("comments-list");
  const item = document.createElement("div");
  item.className = "comment-item";
  item.innerHTML = `
    <div class="comment-avatar">S</div>
    <div class="comment-body">
      <div class="comment-header">
        <span class="comment-name">Tum</span>
        <span class="comment-time">Just now</span>
      </div>
      <div class="comment-text">${text}</div>
      <div class="comment-footer">
        <button class="comment-like"><i class="ti ti-thumb-up"></i> 0</button>
        <button class="comment-reply-btn">Reply</button>
      </div>
    </div>
  `;
  list.insertBefore(item, list.firstChild);
  input.value = "";
}

// ===== INDEX.HTML — POST CLICK KARNE PAR POST.HTML OPEN KARO =====
// Yeh code index.html ke liye hai — script.js mein add karo