export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">KDN 게시판</div>
        <div className="footer-info">
          <span>한국전력기술 주식회사</span>
          <span className="footer-divider">|</span>
          <span>경기도 용인시 기흥구 이현로 72</span>
          <span className="footer-divider">|</span>
          <span>대표전화 031-8045-2000</span>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} KDN. All rights reserved.</div>
      </div>
    </footer>
  )
}
