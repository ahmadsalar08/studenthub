import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bafpnqleaivhlbtbvufg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_dyg3P9bHZkwRn7_bErLySw_lGPgdGfc'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ===== AUTH CHECK — sirf logged in user access kar sake =====
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.href = 'login.html'
    return
  }
  const user = session.user
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
    date: new Date(p.created_at).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'}),
    views: 0,
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
    : `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">Koi post nahi mili</td></tr>`
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
  if (!confirm(`"${post.title}" — delete karna chahte ho?`)) return

  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) { showToast('Delete nahi hua: ' + error.message); return }

  adminPosts = adminPosts.filter(p => p.id !== id)
  renderDashboardPosts()
  renderAllPosts()
  showToast('Post delete ho gayi!')
}
window.deletePost = deletePost

// ===== COMMENTS =====
const adminComments = [
  { name:"Sara Rashid", post:"1st year CS guide", text:"Bohot helpful article hai!", time:"2 days ago" },
  { name:"Usman Baig", post:"Free tools article", text:"CS50 Harvard course recommend karna sahi hai.", time:"3 days ago" },
  { name:"Hina Malik", post:"1st year CS guide", text:"Dosto wala point bilkul sahi hai.", time:"5 days ago" },
]

function renderComments() {
  document.getElementById('admin-comments').innerHTML = adminComments.map((c, i) => `
    <div class="ca-item" id="ca-${i}">
      <div class="ca-avatar">${c.name.split(' ').map(n=>n[0]).join('')}</div>
      <div>
        <div class="ca-name">${c.name} <span style="font-weight:400;color:var(--text-muted)">· ${c.time}</span></div>
        <div class="ca-post">On: ${c.post}</div>
        <div class="ca-text">${c.text}</div>
      </div>
      <div class="ca-actions">
        <button class="ca-approve" onclick="approveComment(${i})"><i class="ti ti-check"></i> Approve</button>
        <button class="ca-delete" onclick="deleteComment(${i})"><i class="ti ti-trash"></i></button>
      </div>
    </div>
  `).join('')
}

function approveComment(i) { showToast('Comment approve ho gaya!'); document.getElementById('ca-' + i).style.opacity = '0.4' }
function deleteComment(i) { document.getElementById('ca-' + i).remove(); showToast('Comment delete ho gaya!') }
window.approveComment = approveComment
window.deleteComment = deleteComment

// ===== EDITOR =====
function format(cmd) { document.execCommand(cmd, false, null); document.getElementById('art-content').focus() }
function insertHeading() { document.execCommand('formatBlock', false, 'h2'); document.getElementById('art-content').focus() }
function insertList() { document.execCommand('insertUnorderedList', false, null); document.getElementById('art-content').focus() }
function insertLink() { const url = prompt('Link URL daalo:'); if (url) document.execCommand('createLink', false, url) }
function insertCallout() {
  const div = document.createElement('div')
  div.style.cssText = 'background:#1e0e3e;border:0.5px solid #4a2a8e;border-radius:8px;padding:14px 16px;margin:16px 0;color:#c8c8d8;'
  div.innerHTML = '💡 Apna tip yahan likho...'
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
    box.innerHTML = `<div class="preview-empty"><i class="ti ti-eye-off"></i><span>Title likhna shuru karo...</span></div>`
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
  if (title.length >= 10) { score += 25; tips.push({ok:true,  text:'Title sahi length ka hai'}) }
  else                     {              tips.push({ok:false, text:'Title 10+ characters ka hona chahiye'}) }
  if (cat)                 { score += 25; tips.push({ok:true,  text:'Category select hai'}) }
  else                     {              tips.push({ok:false, text:'Category select karo'}) }
  if (content.length >= 200) { score += 25; tips.push({ok:true,  text:'Content kaafi hai'}) }
  else                       {              tips.push({ok:false, text:'200+ characters ka content likho'}) }
  if (document.getElementById('art-tags').value) { score += 25; tips.push({ok:true, text:'Tags add hain'}) }
  else { tips.push({ok:false, text:'Tags add karo'}) }
  const fill = document.getElementById('seo-fill')
  const label = document.getElementById('seo-label')
  fill.style.width = score + '%'
  fill.style.background = score < 50 ? '#ef4444' : score < 75 ? '#eab308' : '#22c55e'
  label.textContent = score < 50 ? 'Improve needed' : score < 75 ? 'Getting better' : 'Good to publish!'
  document.getElementById('seo-tips').innerHTML = tips.map(t => `
    <div class="seo-tip ${t.ok ? 'ok' : 'bad'}"><i class="ti ti-${t.ok ? 'check' : 'x'}"></i> ${t.text}</div>
  `).join('')
}

// ===== PUBLISH — SUPABASE =====
async function publishPost() {
  const title   = document.getElementById('art-title').value.trim()
  const cat     = document.getElementById('art-category').value
  const content = document.getElementById('art-content').innerHTML.trim()
  const excerpt = document.getElementById('art-content').innerText.trim().substring(0, 200)

  if (!title)   { showToast('Title daalo pehle!'); return }
  if (!cat)     { showToast('Category select karo!'); return }
  if (!content) { showToast('Content likho pehle!'); return }

  const btn = document.querySelector('.pub-btn')
  btn.innerHTML = '<i class="ti ti-loader"></i> Publishing...'
  btn.disabled = true

  const { data: { session } } = await supabase.auth.getSession()
  const authorName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Anonymous'

  const slug = generateSlug(title)

  const { error } = await supabase.from('posts').insert({
    title,
    slug,
    content,
    excerpt,
    category: cat,
    author_name: authorName,
    published: true
  })

  if (error) {
    btn.innerHTML = '<i class="ti ti-send"></i> Publish article'
    btn.disabled = false
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      showToast('Is title ka article pehle se exist karta hai!')
    } else {
      showToast('Error: ' + error.message)
    }
    return
  }

  btn.innerHTML = '<i class="ti ti-send"></i> Publish article'
  btn.disabled = false
  document.getElementById('art-title').value = ''
  document.getElementById('art-content').innerHTML = ''
  document.getElementById('art-category').value = ''
  document.getElementById('art-tags').value = ''
  updatePreview()
  await loadAdminPosts()
  showPanel('posts')
  showToast('Article publish ho gaya! 🎉')
}
window.publishPost = publishPost

// ===== SAVE DRAFT =====
async function saveDraft() {
  const title   = document.getElementById('art-title').value.trim()
  const cat     = document.getElementById('art-category').value
  const content = document.getElementById('art-content').innerHTML.trim()
  const excerpt = document.getElementById('art-content').innerText.trim().substring(0, 200)

  if (!title) { showToast('Title daalo pehle!'); return }

  const { data: { session } } = await supabase.auth.getSession()
  const authorName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Anonymous'
  const slug = generateSlug(title) + '-draft-' + Date.now()

  const { error } = await supabase.from('posts').insert({
    title, slug, content, excerpt,
    category: cat || 'General',
    author_name: authorName,
    published: false
  })

  if (error) { showToast('Draft save nahi hua: ' + error.message); return }
  await loadAdminPosts()
  showToast('Draft save ho gaya!')
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
  renderComments()
})
