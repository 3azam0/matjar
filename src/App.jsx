import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.jsx';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx').then((m) => ({ default: m.AdminApp })));

function AdminFallback() {
  return (
    <div className="admin-route-fallback" dir="rtl">
      <p>جاري تحميل لوحة التحكم…</p>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route
          path="/admin/*"
          element={(
            <Suspense fallback={<AdminFallback />}>
              <AdminApp />
            </Suspense>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && <FloatingWhatsApp />}
    </>
  );
}
