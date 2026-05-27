import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'

const PAGE_SIZE = 10

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function NoticeList({ notices }: { notices: Post[] }) {
  if (notices.length === 0) return null
  return (
    <div className="notice-list">
      {notices.map(n => (
        <Link key={n.id} to={`/posts/${n.id}`} className="notice-item">
          <span className="notice-badge">공지</span>
          <span className="notice-title">📢 {n.title}</span>
          <span className="notice-date">{formatDate(n.created_at)}</span>
        </Link>
      ))}
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  const preview = post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content
  return (
    <Link to={`/posts/${post.id}`} className="post-card">
      <div className="post-card-body">
        <h2 className="post-card-title">{post.title}</h2>
        <p className="post-card-preview">{preview}</p>
      </div>
      <div className="post-card-footer">
        <span className="post-author">{post.profiles?.email ?? '익명'}</span>
        <span className="post-date">{formatDate(post.created_at)}</span>
      </div>
    </Link>
  )
}

export default function PostList() {
  const [notices, setNotices] = useState<Post[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('posts')
      .select('*, profiles(id, email)')
      .eq('is_notice', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotices((data as Post[]) ?? []))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    supabase
      .from('posts')
      .select('*, profiles(id, email)', { count: 'exact' })
      .eq('is_notice', false)
      .order('created_at', { ascending: false })
      .range(from, to)
      .then(({ data, count, error }) => {
        if (cancelled) return
        if (error) { setError(error.message) }
        else { setPosts((data as Post[]) ?? []); setTotal(count ?? 0) }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="page">
      <div className="page-hero">
        <div className="container">
          <div className="page-header">
            <h1>게시글</h1>
            <span className="total-count">총 {total}개</span>
          </div>
        </div>
      </div>

      <div className="container page-body">
        <NoticeList notices={notices} />

        {loading && <div className="loading">불러오는 중...</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && (
          posts.length === 0
            ? <div className="empty">아직 게시글이 없습니다.</div>
            : <div className="card-grid">{posts.map(p => <PostCard key={p.id} post={p} />)}</div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>이전</button>
            <span>{page} / {totalPages}</span>
            <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>다음</button>
          </div>
        )}
      </div>
    </div>
  )
}
