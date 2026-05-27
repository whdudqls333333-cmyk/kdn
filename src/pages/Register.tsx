import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signUp(email, password)
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>가입 완료!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
          인증 이메일을 발송했습니다.<br />메일함을 확인한 뒤 로그인해 주세요.
        </p>
        <Link to="/login" className="btn btn-primary btn-full">로그인 페이지로</Link>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>회원가입</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호 (6자 이상)</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" minLength={6} required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className="auth-link">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
      </div>
    </div>
  )
}
