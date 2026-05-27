import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="nav-logo">KDN 게시판</Link>
        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-email">{user.email}</span>
              <Link to="/posts/create" className="btn btn-primary btn-sm">글쓰기</Link>
              <button onClick={handleSignOut} className="btn btn-outline btn-sm">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">로그인</Link>
              <Link to="/register" className="btn btn-primary btn-sm">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
