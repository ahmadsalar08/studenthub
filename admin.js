import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bafpnqleaivhlbtbvufg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_dyg3P9bHZkwRn7_bErLySw_lGPgdGfc'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ===== AUTH CHECK =====
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) { window.location.href = 'login.html'; return }
  const user = session.user
  const ADMIN_EMAIL = 'ahmadsalar4321@gmail.com'
  if (user.email !== ADMIN_EMAIL) { window.location.href = 'index.html'; return }
  const name = user.user_metadata?.full_name || user.email.split('@')[0]
  const initial = name.charAt(0).toUpperCase()
  const el = document.querySelector('.as-user-name')
  if (el) el.textContent = name
  const av = document.querySelector('.as-avatar')
  if (av) av.textContent = initial
}
checkAuth()

// ===== LOGOUT =====
document.querySelector('.as-logout')?.addEventListener('click', async (e) => {
  e.preventDefault()
  await supabase.auth.signOut()
  window.location.href = 'login.html'
})

// ===== SLUG GENERATOR =====
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ===== LOAD REAL DASHBOARD STATS =====
async function loadDashboardStats() {
  // Total published posts
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  // Total views (sum of all posts views)
  const { data: viewsData } = await supabase
    .from('posts')
    .select('views')
  const totalViews = viewsData
    ? viewsData.reduce((sum, p) => sum + (p.views || 0), 0)
    : 0

  // Total comments
  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })

  // Total likes
  const { count: totalLikes } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })

  // Update stat numbers in DOM
  const nums = document.querySelectorAll('.stat-card-num')
  if (nums[0]) nums[0].textContent = totalPosts || 0
  if (nums[1]) nums[1].textContent = totalViews >= 1000
    ? (totalViews / 1000).toFixed(1) + 'k'
    : totalViews || 0
  if (nums[2]) nums[2].textContent = totalLikes || 0
  if (nums[3]) nums[3].textContent = totalComments || 0

  // Update labels to match
  const labels = document.querySelectorAll('.stat-card-label')
  if (labels[0]) labels[0].textContent = 'Total articles'
  if (labels[1]) labels[1].textContent = 'Total views'
  if (labels[2]) labels[2].textContent = 'Total likes'
  if (labels[3]) labels[3].textContent = 'Total comments'

  // Update trends
  const trends = document.querySelectorAll('.stat-card-trend')
  if (trends[0]) trends[0].innerHTML = `<i class="ti ti-files"></i> ${totalPosts || 0} published`
  if (trends[1]) trends[1].innerHTML = `<i class="ti ti-eye"></i> ${totalViews} total`
  if (trends[2]) trends[2].innerHTML = `<i class="ti ti-heart"></i> ${totalLikes || 0} total`
  if (trends[3]) trends[3].innerHTML = `<i class="ti ti-message-circle"></i> ${totalComments || 0} total`
}

// ===== LOAD POSTS FROM SUPABASE =====
let adminPosts = []

async function loadAdminPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) { console.error(error); return }

  adminPosts = data.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    cat: p.category || 'General',
    date: new Date(p.created_at).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    }),
    views: p.views || 0,
    status: p.published ? 'published' : 'draft'
  }))

  renderDashboardPosts()
  renderAllPosts()
}

// ===== PANEL SWITCH =====
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'))
  document.querySelectorAll('.as-link').forEach(l => l.classList.remove('active'))
  document.getElementById('panel-' + name).classList.remove('hidden')
  document.getElementById('topbar-title').textContent =
    name === 'dashboard' ? 'Dashboard' :
    name === 'write'     ? 'Write Article' :
    name === 'posts'     ? 'All Posts' : 'Comments'
  document.querySelectorAll('.as-link').forEach(l => {
    if (l.getAttribute('onclick') === `showPanel('${name}')`) l.classList.add('active')
  })
}
window.showPanel = showPanel

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
          <button class="td-btn" onclick="deletePost('${post.id}')">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `
}

function renderDashboardPosts() {
  const tbody = document.getElementById('dashboard-posts')
  if (!tbody) return
  tbody.innerHTML = adminPosts.slice(0, 5).map(postRow).join('')
}

function renderAllPosts(list = adminPosts) {
  const tbody = document.getElementById('all-posts-table')
  if (!tbody) return
  tbody.innerHTML = list.length
    ? list.map(postRow).join('')
    : `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">No posts found</td></tr>`
}

function filterAdminPosts() {
  const search = document.getElementById('posts-search').value.toLowerCase()
  const cat    = document.getElementById('posts-filter').value
  const result = adminPosts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search)
    const matchCat    = cat === 'all' || p.cat === cat
    return matchSearch && matchCat
  })
  renderAllPosts(result)
}
window.filterAdminPosts = filterAdminPosts

// ===== DELETE POST =====
async function deletePost(id) {
  const post = adminPosts.find(p => p.id === id)
  if (!post) return
  if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return

  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) { showToast('Delete failed: ' + error.message); return }

  adminPosts = adminPosts.filter(p => p.id !== id)
  renderDashboardPosts()
  renderAllPosts()
  await loadDashboardStats()
  showToast('Post deleted!')
}
window.deletePost = deletePost

// ===== COMMENTS — Real from Supabase =====
async function loadRealComments() {
  const { data, error } = await supabase
    .from('comments')
    .select('*, posts(title)')
    .order('created_at', { ascending: false })

  if (error) { console.error(error); return }

  const container = document.getElementById('admin-comments')
  if (!container) return

  if (!data || data.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:32px">No comments yet</div>`
    return
  }

  container.innerHTML = data.map((c, i) => `
    <div class="ca-item" id="ca-${i}">
      <div class="ca-avatar">${(c.author_name || 'A').charAt(0).toUpperCase()}</div>
      <div>
        <div class="ca-name">${c.author_name || 'Anonymous'}
          <span style="font-weight:400;color:var(--text-muted)">·
            ${new Date(c.created_at).toLocaleDateString('en-US', {day:'numeric', month:'short'})}
          </span>
        </div>
        <div class="ca-post">On: ${c.posts?.title || 'Unknown post'}</div>
        <div class="ca-text">${c.content || ''}</div>
      </div>
      <div class="ca-actions">
        <button class="ca-delete" onclick="deleteCommentDB('${c.id}', ${i})">
          <i class="ti ti-trash"></i>
        </button>
      </div>
    </div>
  `).join('')
}

async function deleteCommentDB(id, i) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) { showToast('Could not delete comment'); return }
  document.getElementById('ca-' + i)?.remove()
  await loadDashboardStats()
  showToast('Comment deleted!')
}
window.deleteCommentDB = deleteCommentDB

// ===== EDITOR =====
function format(cmd) { document.execCommand(cmd, false, null); document.getElementById('art-content').focus() }
function insertHeading() { document.execCommand('formatBlock', false, 'h2'); document.getElementById('art-content').focus() }
function insertList() { document.execCommand('insertUnorderedList', false, null); document.getElementById('art-content').focus() }
function insertLink() { const url = prompt('Enter link URL:'); if (url) document.execCommand('createLink', false, url) }
function insertCallout() {
  const div = document.createElement('div')
  div.style.cssText = 'background:#1e0e3e;border:0.5px solid #4a2a8e;border-radius:8px;padding:14px 16px;margin:16px 0;color:#c8c8d8;'
  div.innerHTML = '💡 Write your tip here...'
  document.getElementById('art-content').appendChild(div)
  updatePreview()
}
window.format = format
window.insertHeading = insertHeading
window.insertList = insertList
window.insertLink = insertLink
window.insertCallout = insertCallout

function updateWordCount() {
  const text = document.getElementById('art-content').innerText || ''
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  document.getElementById('word-count').textContent = `${words} words`
  document.getElementById('char-count').textContent = `${text.length} characters`
}

function updatePreview() {
  updateWordCount()
  const title = document.getElementById('art-title').value
  const cat   = document.getElementById('art-category').value
  const box   = document.getElementById('preview-box')
  if (!title) {
    box.innerHTML = `<div class="preview-empty"><i class="ti ti-eye-off"></i><span>Start writing a title...</span></div>`
  } else {
    box.innerHTML = `
      ${cat ? `<div class="preview-cat">${cat}</div><br>` : ''}
      <div class="preview-title">${title}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:8px">Today</div>
    `
  }
  updateSEO(title, cat)
}
window.updatePreview = updatePreview

function updateSEO(title, cat) {
  const content = document.getElementById('art-content').innerText || ''
  let score = 0; const tips = []
  if (title.length >= 10) { score += 25; tips.push({ok:true,  text:'Title length is good'}) }
  else                     {              tips.push({ok:false, text:'Title should be 10+ characters'}) }
  if (cat)                 { score += 25; tips.push({ok:true,  text:'Category is selected'}) }
  else                     {              tips.push({ok:false, text:'Please select a category'}) }
  if (content.length >= 200) { score += 25; tips.push({ok:true,  text:'Content length is sufficient'}) }
  else                       {              tips.push({ok:false, text:'Write at least 200+ characters'}) }
  if (document.getElementById('art-tags').value) { score += 25; tips.push({ok:true, text:'Tags have been added'}) }
  else { tips.push({ok:false, text:'Please add some tags'}) }
  const fill  = document.getElementById('seo-fill')
  const label = document.getElementById('seo-label')
  fill.style.width = score + '%'
  fill.style.background = score < 50 ? '#ef4444' : score < 75 ? '#eab308' : '#22c55e'
  label.textContent = score < 50 ? 'Improve needed' : score < 75 ? 'Getting better' : 'Good to publish!'
  document.getElementById('seo-tips').innerHTML = tips.map(t => `
    <div class="seo-tip ${t.ok ? 'ok' : 'bad'}"><i class="ti ti-${t.ok ? 'check' : 'x'}"></i> ${t.text}</div>
  `).join('')
}

// ===== PUBLISH =====
async function publishPost() {
  const title   = document.getElementById('art-title').value.trim()
  const cat     = document.getElementById('art-category').value
  const content = document.getElementById('art-content').innerHTML.trim()
  const excerpt = document.getElementById('art-content').innerText.trim().substring(0, 200)

  if (!title)   { showToast('Please enter a title first!'); return }
  if (!cat)     { showToast('Please select a category!'); return }
  if (!content) { showToast('Please write some content first!'); return }

  const btn = document.querySelector('.pub-btn')
  btn.innerHTML = '<i class="ti ti-loader"></i> Publishing...'
  btn.disabled = true

  const { data: { session } } = await supabase.auth.getSession()
  const authorName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Anonymous'
  const slug = generateSlug(title)

  const { error } = await supabase.from('posts').insert({
    title, slug, content, excerpt,
    category: cat,
    author_name: authorName,
    published: true
  })

  btn.innerHTML = '<i class="ti ti-send"></i> Publish article'
  btn.disabled = false

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      showToast('An article with this title already exists!')
    } else {
      showToast('Error: ' + error.message)
    }
    return
  }

  document.getElementById('art-title').value = ''
  document.getElementById('art-content').innerHTML = ''
  document.getElementById('art-category').value = ''
  document.getElementById('art-tags').value = ''
  updatePreview()
  await loadAdminPosts()
  await loadDashboardStats()
  showPanel('posts')
  showToast('Article published! 🎉')
}
window.publishPost = publishPost

// ===== SAVE DRAFT =====
async function saveDraft() {
  const title   = document.getElementById('art-title').value.trim()
  const cat     = document.getElementById('art-category').value
  const content = document.getElementById('art-content').innerHTML.trim()
  const excerpt = document.getElementById('art-content').innerText.trim().substring(0, 200)

  if (!title) { showToast('Please enter a title first!'); return }

  const { data: { session } } = await supabase.auth.getSession()
  const authorName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Anonymous'
  const slug = generateSlug(title) + '-draft-' + Date.now()

  const { error } = await supabase.from('posts').insert({
    title, slug, content, excerpt,
    category: cat || 'General',
    author_name: authorName,
    published: false
  })

  if (error) { showToast('Draft could not be saved: ' + error.message); return }
  await loadAdminPosts()
  await loadDashboardStats()
  showToast('Draft saved!')
}
window.saveDraft = saveDraft

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast')
  t.innerHTML = `<i class="ti ti-check-circle" style="color:#4ade80"></i> ${msg}`
  t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 3000)
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  document.querySelector('.admin-sidebar').classList.toggle('mobile-open')
}
window.toggleMobileMenu = toggleMobileMenu

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadAdminPosts()
  loadDashboardStats()
  loadRealComments()
})