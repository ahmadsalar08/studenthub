import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bafpnqleaivhlbtbvufg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZnBucWxlYWl2aGxidGJ2dWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMjYsImV4cCI6MjA5NTU0MjMyNn0.U7dlH_j_CoSL4kqHQjqcaCziWU-tAOO2WJnjPbbAM8I'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const params = new URLSearchParams(window.location.search)
const slug = params.get('slug')
let currentPostId = null
let liked = false

async function loadPost() {
  if (!slug) { showError("No article found!"); return; }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !data) { showError("This article was not found or has been deleted!"); return; }

  currentPostId = data.id

  // Atomic view increment — race condition safe
  try {
  await supabase.rpc('increment_views', { post_id: data.id })
} catch {
  await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id)
}
  document.title = `${data.title} — StudentHub`
  if (window.updateOGTags) window.updateOGTags(data.title, data.excerpt || '')

  setEl("art-title", data.title)
  setEl("art-author", data.author_name || "Anonymous")
  setEl("art-author-2", data.author_name || "Anonymous")
  setEl("art-category", data.category || "General")
  setEl("art-date", new Date(data.created_at).toLocaleDateString('en-US', {day:'numeric', month:'long', year:'numeric'}))

  const contentEl = document.getElementById("art-content")
  if (contentEl && data.content) {
    contentEl.innerHTML = DOMPurify.sanitize(data.content)
  }

  const avatarEls = document.querySelectorAll(".art-avatar")
  avatarEls.forEach(el => { el.textContent = (data.author_name || "A").charAt(0).toUpperCase() })

  await loadLikeState()
}

function setEl(id, text) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

function showError(msg) {
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:80vh;gap:16px">
      <div style="font-size:48px">😕</div>
      <div style="color:#fff;font-size:20px;font-weight:600">${msg}</div>
      <a href="index.html" style="color:#a78bfa">Go back home</a>
    </div>
  `
}

loadPost().then(() => loadComments())

window.addEventListener("scroll", () => {
  const article = document.querySelector(".art-content")
  const bar = document.getElementById("progress-bar")
  if (!article || !bar) return
  const rect = article.getBoundingClientRect()
  const total = article.offsetHeight - window.innerHeight
  const scrolled = -rect.top
  const pct = Math.min(Math.max((scrolled / total) * 100, 0), 100)
  bar.style.width = pct + "%"
})

async function loadLikeState() {
  if (!currentPostId) return

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', currentPostId)

  const likeCount = count || 0
  const likeCountEl = document.getElementById("like-count")
  const likeCountEl2 = document.getElementById("like-count-2")
  if (likeCountEl) likeCountEl.textContent = likeCount
  if (likeCountEl2) likeCountEl2.textContent = likeCount

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', currentPostId)
    .eq('user_id', session.user.id)
    .single()

  liked = !!existingLike

  const likeBtn = document.getElementById("like-btn")
  const likeBigBtn = document.getElementById("like-big-btn")
  if (likeBtn) likeBtn.classList.toggle("liked", liked)
  if (likeBigBtn) {
    likeBigBtn.style.background = liked ? "var(--purple)" : "var(--purple-dim)"
    likeBigBtn.style.color = liked ? "#fff" : "var(--purple-light)"
  }
}

async function toggleLike() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) { alert('Please log in to like this article!'); return }

  const userId = session.user.id

  if (!liked) {
    await supabase.from('likes').insert({ post_id: currentPostId, user_id: userId })
    liked = true
  } else {
    await supabase.from('likes').delete().eq('post_id', currentPostId).eq('user_id', userId)
    liked = false
  }

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', currentPostId)

  const likeCount = count || 0
  const likeCountEl = document.getElementById("like-count")
  const likeCountEl2 = document.getElementById("like-count-2")
  if (likeCountEl) likeCountEl.textContent = likeCount
  if (likeCountEl2) likeCountEl2.textContent = likeCount

  const likeBtn = document.getElementById("like-btn")
  const likeBigBtn = document.getElementById("like-big-btn")
  if (likeBtn) likeBtn.classList.toggle("liked", liked)
  if (likeBigBtn) {
    likeBigBtn.style.background = liked ? "var(--purple)" : "var(--purple-dim)"
    likeBigBtn.style.color = liked ? "#fff" : "var(--purple-light)"
  }
}
window.toggleLike = toggleLike

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  const btn = document.querySelector('[onclick="copyLink()"]')
  const original = btn.innerHTML
  btn.innerHTML = '<i class="ti ti-check"></i>'
  btn.style.color = "#4ade80"
  setTimeout(() => { btn.innerHTML = original; btn.style.color = "" }, 2000)
}
window.copyLink = copyLink

let commentCount = 0

async function addComment() {
  const input = document.getElementById("comment-input")
  const text = input.value.trim()
  if (!text) return

  const { data: { session } } = await supabase.auth.getSession()
  const authorName = session?.user?.user_metadata?.full_name
    || session?.user?.email?.split('@')[0]
    || 'Anonymous'

  const { error } = await supabase.from('comments').insert({
    post_id: currentPostId,
    author_name: authorName,
    content: text
  })

  if (error) { console.error(error); return }

  commentCount++
  const countEl = document.querySelector(".comments-count")
  if (countEl) countEl.textContent = commentCount

  const list = document.getElementById("comments-list")
  const item = document.createElement("div")
  item.className = "comment-item"
  const initial = authorName.charAt(0).toUpperCase()
  item.innerHTML = `
    <div class="comment-avatar">${initial}</div>
    <div class="comment-body">
      <div class="comment-header">
        <span class="comment-name">${authorName}</span>
        <span class="comment-time">Just now</span>
      </div>
      <div class="comment-text">${DOMPurify.sanitize(text)}</div>
      <div class="comment-footer">
        <button class="comment-like"><i class="ti ti-thumb-up"></i> 0</button>
        <button class="comment-reply-btn">Reply</button>
      </div>
    </div>
  `
  list.insertBefore(item, list.firstChild)
  input.value = ""
}
window.addComment = addComment

async function loadComments() {
  if (!currentPostId) return

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', currentPostId)
    .order('created_at', { ascending: false })

  if (error) { console.error(error); return }

  const list = document.getElementById('comments-list')
  if (!list) return

  list.innerHTML = ''
  commentCount = data.length
  const countEl = document.querySelector('.comments-count')
  if (countEl) countEl.textContent = commentCount

  if (data.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:32px;color:var(--text-muted)">
        <i class="ti ti-message-off" style="font-size:28px;display:block;margin-bottom:8px"></i>
        No comments yet — be the first!
      </div>
    `
    return
  }

  data.forEach(comment => {
    const item = document.createElement('div')
    item.className = 'comment-item'
    const initial = (comment.author_name || 'A').charAt(0).toUpperCase()
    item.innerHTML = `
      <div class="comment-avatar">${initial}</div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-name">${DOMPurify.sanitize(comment.author_name || 'Anonymous')}</span>
          <span class="comment-time">${new Date(comment.created_at).toLocaleDateString()}</span>
        </div>
        <div class="comment-text">${DOMPurify.sanitize(comment.content)}</div>
        <div class="comment-footer">
          <button class="comment-like"><i class="ti ti-thumb-up"></i> 0</button>
          <button class="comment-reply-btn">Reply</button>
        </div>
      </div>
    `
    list.appendChild(item)
  })
}
window.loadComments = loadComments