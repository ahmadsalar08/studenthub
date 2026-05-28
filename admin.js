// ===== DATA =====
const adminPosts = [
  { id:1, title:"1st year CS student survival guide", cat:"Student Life", date:"20 May 2026", views:892, status:"published" },
  { id:2, title:"Exams ki tayari — last minute strategy", cat:"Study Tips", date:"18 May 2026", views:654, status:"published" },
  { id:3, title:"Free tools jo har CS student ko chahiye", cat:"Tech & Tools", date:"15 May 2026", views:543, status:"published" },
  { id:4, title:"2nd year mein internship kaise milti hai", cat:"Career", date:"12 May 2026", views:421, status:"published" },
  { id:5, title:"Student life mein time management", cat:"Lifestyle", date:"10 May 2026", views:312, status:"published" },
  { id:6, title:"CGPA anxiety — kab serious lein?", cat:"Mental Health", date:"8 May 2026", views:289, status:"draft" },
];

const adminComments = [
  { name:"Sara Rashid", post:"1st year CS guide", text:"Bohot helpful article hai! Maine bhi yahi mistakes ki thi.", time:"2 days ago" },
  { name:"Usman Baig", post:"Free tools article", text:"CS50 Harvard course recommend karna sahi hai. Life changing tha.", time:"3 days ago" },
  { name:"Hina Malik", post:"1st year CS guide", text:"Dosto wala point bilkul sahi hai. Mera semester waste hua galat logon se.", time:"5 days ago" },
];

// ===== PANEL SWITCH =====
function showPanel(name) {
  document.querySelectorAll(".panel").forEach(p => p.classList.add("hidden"));
  document.querySelectorAll(".as-link").forEach(l => l.classList.remove("active"));
  document.getElementById("panel-" + name).classList.remove("hidden");
  document.getElementById("topbar-title").textContent =
    name === "dashboard" ? "Dashboard" :
    name === "write"     ? "Write Article" :
    name === "posts"     ? "All Posts" : "Comments";
  const links = document.querySelectorAll(".as-link");
  links.forEach(l => {
    if (l.getAttribute("onclick") === `showPanel('${name}')`) {
      l.classList.add("active");
    }
  });
}

// ===== RENDER TABLE ROW =====
function postRow(post) {
  return `
    <tr>
      <td><div class="td-title">${post.title}</div></td>
      <td><span class="td-cat">${post.cat}</span></td>
      <td>${post.date}</td>
      <td>${post.views.toLocaleString()}</td>
      <td><span class="${post.status === 'published' ? 'status-pub' : 'status-draft'}">
        ${post.status === 'published' ? 'Published' : 'Draft'}
      </span></td>
      <td>
        <div class="td-actions">
          <button class="td-btn" onclick="editPost(${post.id})">
            <i class="ti ti-edit"></i> Edit
          </button>
          <button class="td-btn del" onclick="deletePost(${post.id})">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// ===== RENDER DASHBOARD POSTS =====
function renderDashboardPosts() {
  const tbody = document.getElementById("dashboard-posts");
  if (!tbody) return;
  tbody.innerHTML = adminPosts.slice(0, 5).map(postRow).join("");
}

// ===== RENDER ALL POSTS =====
function renderAllPosts(list = adminPosts) {
  const tbody = document.getElementById("all-posts-table");
  if (!tbody) return;
  tbody.innerHTML = list.length
    ? list.map(postRow).join("")
    : `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">Koi post nahi mili</td></tr>`;
}

// ===== FILTER POSTS =====
function filterAdminPosts() {
  const search = document.getElementById("posts-search").value.toLowerCase();
  const cat    = document.getElementById("posts-filter").value;
  const result = adminPosts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search);
    const matchCat    = cat === "all" || p.cat === cat;
    return matchSearch && matchCat;
  });
  renderAllPosts(result);
}

// ===== EDIT POST =====
function editPost(id) {
  showPanel("write");
  const post = adminPosts.find(p => p.id === id);
  if (post) {
    document.getElementById("art-title").value = post.title;
    document.getElementById("art-category").value = post.cat;
    showToast(`"${post.title}" — editing mode`);
  }
}

// ===== DELETE POST =====
function deletePost(id) {
  const post = adminPosts.find(p => p.id === id);
  if (!post) return;
  if (confirm(`"${post.title}" — delete karna chahte ho?`)) {
    const idx = adminPosts.indexOf(post);
    adminPosts.splice(idx, 1);
    renderDashboardPosts();
    renderAllPosts();
    showToast("Post delete ho gayi!");
  }
}

// ===== RENDER COMMENTS =====
function renderComments() {
  document.getElementById("admin-comments").innerHTML = adminComments.map((c, i) => `
    <div class="ca-item" id="ca-${i}">
      <div class="ca-avatar">${c.name.split(" ").map(n=>n[0]).join("")}</div>
      <div>
        <div class="ca-name">${c.name} <span style="font-weight:400;color:var(--text-muted)">· ${c.time}</span></div>
        <div class="ca-post">On: ${c.post}</div>
        <div class="ca-text">${c.text}</div>
      </div>
      <div class="ca-actions">
        <button class="ca-approve" onclick="approveComment(${i})">
          <i class="ti ti-check"></i> Approve
        </button>
        <button class="ca-delete" onclick="deleteComment(${i})">
          <i class="ti ti-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

function approveComment(i) {
  showToast("Comment approve ho gaya!");
  document.getElementById("ca-" + i).style.opacity = "0.4";
}

function deleteComment(i) {
  document.getElementById("ca-" + i).remove();
  showToast("Comment delete ho gaya!");
}

// ===== EDITOR: FORMAT =====
function format(cmd) {
  document.execCommand(cmd, false, null);
  document.getElementById("art-content").focus();
}

function insertHeading() {
  document.execCommand("formatBlock", false, "h2");
  document.getElementById("art-content").focus();
}

function insertList() {
  document.execCommand("insertUnorderedList", false, null);
  document.getElementById("art-content").focus();
}

function insertCallout() {
  const div = document.createElement("div");
  div.style.cssText = "background:#1e0e3e;border:0.5px solid #4a2a8e;border-radius:8px;padding:14px 16px;margin:16px 0;color:#c8c8d8;";
  div.innerHTML = "💡 Apna tip yahan likho...";
  div.contentEditable = "false";
  const sel = window.getSelection();
  if (sel.rangeCount) {
    sel.getRangeAt(0).insertNode(div);
  } else {
    document.getElementById("art-content").appendChild(div);
  }
  updatePreview();
}

function insertLink() {
  const url = prompt("Link URL daalo:");
  if (url) document.execCommand("createLink", false, url);
}

// ===== WORD COUNT =====
function updateWordCount() {
  const text = document.getElementById("art-content").innerText || "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById("word-count").textContent = `${words} words`;
  document.getElementById("char-count").textContent = `${text.length} characters`;
}

// ===== PREVIEW =====
function updatePreview() {
  updateWordCount();
  const title = document.getElementById("art-title").value;
  const cat   = document.getElementById("art-category").value;
  const box   = document.getElementById("preview-box");

  if (!title) {
    box.innerHTML = `<div class="preview-empty"><i class="ti ti-eye-off"></i><span>Title likhna shuru karo...</span></div>`;
  } else {
    box.innerHTML = `
      ${cat ? `<div class="preview-cat">${cat}</div><br>` : ""}
      <div class="preview-title">${title}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:8px">
        Tumhara Naam · Today
      </div>
    `;
  }
  updateSEO(title, cat);
}

// ===== SEO SCORE =====
function updateSEO(title, cat) {
  const content = document.getElementById("art-content").innerText || "";
  let score = 0;
  const tips = [];

  if (title.length >= 10) { score += 25; tips.push({ok:true,  text:"Title sahi length ka hai"}); }
  else                     {              tips.push({ok:false, text:"Title 10+ characters ka hona chahiye"}); }

  if (cat)                 { score += 25; tips.push({ok:true,  text:"Category select hai"}); }
  else                     {              tips.push({ok:false, text:"Category select karo"}); }

  if (content.length >= 200) { score += 25; tips.push({ok:true,  text:"Content kaafi hai"}); }
  else                       {              tips.push({ok:false, text:"200+ characters ka content likho"}); }

  if (document.getElementById("art-tags").value) {
                             score += 25; tips.push({ok:true,  text:"Tags add hain"}); }
  else                     {              tips.push({ok:false, text:"Tags add karo"}); }

  const fill  = document.getElementById("seo-fill");
  const label = document.getElementById("seo-label");
  fill.style.width = score + "%";
  fill.style.background = score < 50 ? "#ef4444" : score < 75 ? "#eab308" : "#22c55e";
  label.textContent = score < 50 ? "Improve needed" : score < 75 ? "Getting better" : "Good to publish!";

  document.getElementById("seo-tips").innerHTML = tips.map(t => `
    <div class="seo-tip ${t.ok ? 'ok' : 'bad'}">
      <i class="ti ti-${t.ok ? 'check' : 'x'}"></i> ${t.text}
    </div>
  `).join("");
}

// ===== PUBLISH =====
function publishPost() {
  const title = document.getElementById("art-title").value.trim();
  const cat   = document.getElementById("art-category").value;
  const content = document.getElementById("art-content").innerText.trim();

  if (!title) { showToast("Title daalo pehle!"); return; }
  if (!cat)   { showToast("Category select karo!"); return; }
  if (!content) { showToast("Content likho pehle!"); return; }

  const btn = document.querySelector(".pub-btn");
  btn.innerHTML = '<i class="ti ti-loader"></i> Publishing...';
  btn.disabled = true;

  setTimeout(() => {
    adminPosts.unshift({
      id: Date.now(), title, cat,
      date: "27 May 2026", views: 0, status: "published"
    });
    renderDashboardPosts();
    renderAllPosts();
    document.getElementById("art-title").value = "";
    document.getElementById("art-content").innerHTML = "";
    document.getElementById("art-category").value = "";
    btn.innerHTML = '<i class="ti ti-send"></i> Publish article';
    btn.disabled = false;
    updatePreview();
    showPanel("posts");
    showToast("Article publish ho gaya! 🎉");
  }, 1200);
}

// ===== SAVE DRAFT =====
function saveDraft() {
  const title = document.getElementById("art-title").value.trim();
  if (!title) { showToast("Title daalo pehle!"); return; }
  showToast("Draft save ho gaya!");
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById("toast");
  t.innerHTML = `<i class="ti ti-check-circle" style="color:#4ade80"></i> ${msg}`;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderDashboardPosts();
  renderAllPosts();
  renderComments();
});
// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const sidebar = document.querySelector(".admin-sidebar");
  sidebar.classList.toggle("mobile-open");
}

// Close menu when panel is selected on mobile
const origShowPanel = showPanel;
window.showPanel = function(name) {
  origShowPanel(name);
  const sidebar = document.querySelector(".admin-sidebar");
  if (sidebar) sidebar.classList.remove("mobile-open");
};
