import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function PostCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('posts')
      .insert({ title: title.trim(), content: content.trim(), author_id: user.id })
      .select()
      .single()

    if (error) { setError(error.message); setLoading(false) }
    else navigate(`/posts/${data.id}`)
  }

  return (
    <div className="container page">
      <div className="form-page">
        <h1>새 글 작성</h1>
        <form onSubmit={handleSubmit} className="post-form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="제목을 입력하세요" required />
          </div>
          <div className="form-group">
            <label htmlFor="content">내용</label>
            <textarea id="content" value={content} onChange={e => setContent(e.target.value)} className="form-textarea" placeholder="내용을 입력하세요" rows={14} required />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">취소</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? '등록 중...' : '등록'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
