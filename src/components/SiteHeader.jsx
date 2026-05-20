import { Link, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { activeClient } from '../config/clients.js';

export function SiteHeader() {
  const { pathname } = useLocation();
  const isCatalog = pathname.startsWith('/catalog');

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-header-brand">
          <img src={activeClient.logo} alt="" className="site-header-logo" width={48} height={48} />
          <div className="site-header-brand-text">
            <span className="site-header-title">{activeClient.displayName}</span>
            <span className="site-header-subtitle">للعبايات الخليجية والزي الإسلامي</span>
          </div>
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
