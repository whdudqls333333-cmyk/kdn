import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Post, Comment } from '../types'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase
      .from('posts')
      .select('*, profiles(id, email)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/'); return }
        setPost(data as Post)
        setLoading(false)
      })
  }, [id, navigate])

  const fetchComments = useCallback(() => {
    supabase
      .from('comments')
      .select('*, profiles(id, email)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComments((data as Comment[]) ?? []))
  }, [id])

  useEffect(() => { fetchComments() }, [fetchComments])

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) navigate('/')
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    setSubmitting(true)
    await supabase.from('comments').insert({ post_id: id, content: newComment.trim(), author_id: user.id })
    setNewComment('')
    fetchComments()
    setSubmitting(false)
  }

  const handleCommentDelete = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId)
    fetchComments()
  }

  if (loading) return <div className="loading">불러오는 중...</div>
  if (!post) return null

  const isAuthor = user?.id === post.author_id

  return (
    <div className="container page">
      <div className="post-detail">
        <div className="post-detail-header">
          <Link to="/" className="back-link">← 목록으로</Link>
          {isAuthor && (
            <div className="post-actions">
              <Link to={`/posts/${id}/edit`} className="btn btn-outline btn-sm">수정</Link>
              <button onClick={handleDelete} className="btn btn-danger btn-sm">삭제</button>
            </div>
          )}
        </div>

        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span>{post.profiles?.email ?? '익명'}</span>
          <span>{formatDate(post.created_at)}</span>
        </div>

        <div className="post-content">{post.content}</div>

        {/* 댓글 */}
        <div className="comments-section">
          <h3>댓글 {comments.length}개</h3>

          {comments.length === 0 && <p className="empty-comments">댓글이 없습니다.</p>}

          {comments.map(c => (
            <div key={c.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{c.profiles?.email ?? '익명'}</span>
                <span className="comment-date">{formatDate(c.created_at)}</span>
                {user?.id === c.author_id && (
                  <button onClick={() => handleCommentDelete(c.id)} className="btn-text-danger">삭제</button>
                )}
              </div>
              <p className="comment-content">{c.content}</p>
            </div>
          ))}

          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={3}
                className="form-textarea"
                required
              />
              <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                {submitting ? '등록 중...' : '댓글 등록'}
              </button>
            </form>
          ) : (
            <p className="login-prompt">
              <Link to="/login">로그인</Link>하면 댓글을 작성할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
