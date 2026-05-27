import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
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

function PostRow({ post, index }: { post: Post; index: number }) {
  return (
    <Link to={`/posts/${post.id}`} className="post-row">
      <span className="post-row-num">{index + 1}</span>
      <span className="post-row-title">{post.title}</span>
      <span className="post-row-author">{post.profiles?.email?.split('@')[0] ?? '익명'}</span>
      <span className="post-row-date">{formatDate(post.created_at)}</span>
    </Link>
  )
}

export default function PostList() {
  const [notices, setNotices] = useState<Post[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
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

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

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
  }, [page, pageSize])

  const totalPages = Math.ceil(total / pageSize)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

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

        {/* 테이블 상단 컨트롤 */}
        <div className="list-controls">
          <div className="page-size-selector">
            <label htmlFor="page-size" className="page-size-label">페이지당</label>
            <select
              id="page-size"
              className="page-size-select"
              value={pageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}개</option>
              ))}
            </select>
          </div>
        </div>

        {/* 리스트 헤더 */}
        <div className="post-list-table">
          <div className="post-list-head">
            <span className="post-row-num">번호</span>
            <span className="post-row-title">제목</span>
            <span className="post-row-author">작성자</span>
            <span className="post-row-date">날짜</span>
          </div>

          {loading && <div className="loading">불러오는 중...</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && (
            posts.length === 0
              ? <div className="empty">아직 게시글이 없습니다.</div>
              : posts.map((p, i) => (
                  <PostRow key={p.id} post={p} index={(page - 1) * pageSize + i} />
                ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(1)}>처음</button>
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>이전</button>
            <div className="pagination-pages">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const p = start + i
                return (
                  <button
                    key={p}
                    className={`page-num-btn${page === p ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
            <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>다음</button>
            <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>마지막</button>
          </div>
        )}
      </div>
    </div>
  )
}
