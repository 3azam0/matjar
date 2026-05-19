import { Link, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import brandLogo from '../assets/logo-old.png';

export function SiteHeader() {
  const { pathname } = useLocation();
  const isCatalog = pathname.startsWith('/catalog');

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-header-brand">
          <img src={brandLogo} alt="" className="site-header-logo" width={48} height={48} />
          <span className="site-header-title">سحر الشرق</span>
        </Link>
        <nav className="site-header-nav" aria-label="التنقل الرئيسي">
          <Link to="/catalog" className={`site-header-link ${isCatalog ? 'is-active' : ''}`}>
            <BookOpen aria-hidden />
            الكتالوج
          </Link>
        </nav>
      </div>
    </header>
  );
}
