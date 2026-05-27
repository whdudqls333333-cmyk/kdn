import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) { setError('이메일 또는 비밀번호가 올바르지 않습니다.'); setLoading(false) }
    else navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>로그인</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="auth-link">계정이 없으신가요? <Link to="/register">회원가입</Link></p>
      </div>
    </div>
  )
}
