import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function PostEdit() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/'); return }
        if (data.author_id !== user?.id) { navigate('/'); return }
        setTitle(data.title)
        setContent(data.content)
        setLoading(false)
      })
  }, [id, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('posts')
      .update({ title: title.trim(), content: content.trim() })
      .eq('id', id)

    if (error) { setError(error.message); setSaving(false) }
    else navigate(`/posts/${id}`)
  }

  if (loading) return <div className="loading">불러오는 중...</div>

  return (
    <div className="container page">
      <div className="form-page">
        <h1>글 수정</h1>
        <form onSubmit={handleSubmit} className="post-form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label htmlFor="content">내용</label>
            <textarea id="content" value={content} onChange={e => setContent(e.target.value)} className="form-textarea" rows={14} required />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">취소</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? '저장 중...' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
