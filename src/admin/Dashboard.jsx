import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Alert, LinearProgress } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
import EmailIcon from '@mui/icons-material/Email';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase } from '../lib/supabase';
import { DashboardReports } from './DashboardReports.jsx';
import './Dashboard.css';

const STAT_THEMES = {
  products: { accent: '#b38e4d', iconBg: 'rgba(179, 142, 77, 0.15)' },
  categories: { accent: '#6d8b4e', iconBg: 'rgba(109, 139, 78, 0.15)' },
  branches: { accent: '#c17832', iconBg: 'rgba(193, 120, 50, 0.15)' },
  branchLinks: { accent: '#2a8f8f', iconBg: 'rgba(42, 143, 143, 0.15)' },
  features: { accent: '#8b5a9b', iconBg: 'rgba(139, 90, 155, 0.15)' },
  settings: { accent: '#5c6b73', iconBg: 'rgba(92, 107, 115, 0.15)' },
  inquiries: { accent: '#d32f2f', iconBg: 'rgba(211, 47, 47, 0.15)' },
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

const StatCard = ({ title, value, icon: Icon, themeKey, to, hint = 'فتح القسم' }) => {
  const theme = STAT_THEMES[themeKey] || STAT_THEMES.products;
  const style = {
    '--stat-accent': theme.accent,
    '--stat-icon-bg': theme.iconBg,
  };

  const content = (
    <>
      <div className="dashboard-stat-card__top">
        <div className="dashboard-stat-card__icon">
          <Icon />
        </div>
        <span className="dashboard-stat-card__arrow" aria-hidden>
          <ChevronIcon />
        </span>
      </div>
      <p className="dashboard-stat-card__label">{title}</p>
      <p className="dashboard-stat-card__value">{value}</p>
      {to ? <span className="dashboard-stat-card__hint">{hint}</span> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="dashboard-stat-card" style={style}>
        {content}
      </Link>
    );
  }

  return (
    <div className="dashboard-stat-card" style={style}>
      {content}
    </div>
  );
};

const RecentList = ({ title, rows, primaryField, secondaryField, emptyText, to }) => (
  <article className="dashboard-panel">
    <header className="dashboard-panel__head">
      <h2 className="dashboard-panel__title">{title}</h2>
      <Link to={to} className="dashboard-link-btn">
        عرض الكل
        <ArrowBackIcon sx={{ fontSize: 14, transform: 'scaleX(-1)' }} />
      </Link>
    </header>
    <div className="dashboard-panel__body">
      {rows.length === 0 ? (
        <p className="dashboard-panel__empty">{emptyText}</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="dashboard-panel__row">
            <p className="dashboard-panel__row-title">{row[primaryField] || row.id}</p>
            {secondaryField && row[secondaryField] ? (
              <p className="dashboard-panel__row-sub">{row[secondaryField]}</p>
            ) : null}
          </div>
        ))
      )}
    </div>
  </article>
);

const EMPTY_DASHBOARD = {
  products: [],
  categories: [],
  branches: [],
  inquiries: [],
  settings: [],
  counts: {
    products: 0,
    categories: 0,
    branches: 0,
    features: 0,
    branchLinks: 0,
    inquiries: 0,
  },
};

async function getRowsWithCount(table, options = {}) {
  const {
    columns = '*',
    orderBy = 'id',
    ascending = true,
    limit = 5,
  } = options;

  const { data, error, count } = await supabase
    .from(table)
    .select(columns, { count: 'exact' })
    .order(orderBy, { ascending })
    .range(0, Math.max(limit - 1, 0));

  if (error) throw error;

  return {
    rows: data || [],
    count: typeof count === 'number' ? count : (data || []).length,
  };
}

export const Dashboard = () => {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [
          productsResult,
          categoriesResult,
          branchesResult,
          featuresResult,
          branchLinksResult,
          settingsResult,
          inquiriesResult,
        ] = await Promise.all([
          getRowsWithCount('products', { orderBy: 'order_index', ascending: false, limit: 5 }),
          getRowsWithCount('categories', { orderBy: 'id', limit: 5 }),
          getRowsWithCount('branches', { orderBy: 'order_index', limit: 5 }),
          getRowsWithCount('features', { orderBy: 'id', limit: 1 }),
          getRowsWithCount('branch_links', { orderBy: 'id', limit: 1 }),
          getRowsWithCount('site_settings', { orderBy: 'id', limit: 1 }),
          getRowsWithCount('inquiries', { orderBy: 'created_at', ascending: false, limit: 5 }),
        ]);

        if (!isMounted) return;

        setDashboard({
          products: productsResult.rows,
          categories: categoriesResult.rows,
          branches: branchesResult.rows,
          inquiries: inquiriesResult.rows,
          settings: settingsResult.rows,
          counts: {
            products: productsResult.count,
            categories: categoriesResult.count,
            branches: branchesResult.count,
            features: featuresResult.count,
            branchLinks: branchLinksResult.count,
            inquiries: inquiriesResult.count,
          },
        });
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error);
        setDashboard(EMPTY_DASHBOARD);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentSettings = dashboard.settings[0];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">لوحة التحكم</h1>
          <p className="dashboard-subtitle">إدارة منتجات وأقسام موقع سحر الشرق</p>
        </div>
        <div className="dashboard-quick-actions">
          <Link to="/admin/products/create" className="dashboard-btn dashboard-btn--primary">
            <AddIcon />
            منتج جديد
          </Link>
          <Link to="/admin/categories/create" className="dashboard-btn dashboard-btn--outline">
            <AddIcon />
            تصنيف جديد
          </Link>
          <a href="/catalog" target="_blank" rel="noopener noreferrer" className="dashboard-btn dashboard-btn--ghost">
            <OpenInNewIcon />
            الكتالوج
          </a>
        </div>
      </header>

      {isLoading ? (
        <div className="dashboard-loading">
          <LinearProgress />
        </div>
      ) : null}

      {loadError ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          تعذر تحميل بيانات لوحة التحكم من قاعدة البيانات: {loadError.message}
        </Alert>
      ) : null}

      <section className="dashboard-stats" aria-label="إحصائيات سريعة">
        <StatCard
          title="المنتجات"
          value={dashboard.counts.products}
          icon={InventoryIcon}
          themeKey="products"
          to="/admin/products"
        />
        <StatCard
          title="التصنيفات"
          value={dashboard.counts.categories}
          icon={CategoryIcon}
          themeKey="categories"
          to="/admin/categories"
        />
        <StatCard
          title="الفروع"
          value={dashboard.counts.branches}
          icon={StoreIcon}
          themeKey="branches"
          to="/admin/branches"
        />
        <StatCard
          title="روابط الفروع"
          value={dashboard.counts.branchLinks}
          icon={LinkIcon}
          themeKey="branchLinks"
          to="/admin/branch_links"
        />
        <StatCard
          title="المميزات"
          value={dashboard.counts.features}
          icon={StarIcon}
          themeKey="features"
          to="/admin/features"
        />
        <StatCard
          title="استفسارات العملاء"
          value={dashboard.counts.inquiries}
          icon={EmailIcon}
          themeKey="inquiries"
          to="/admin/inquiries"
        />
        <StatCard
          title="إعدادات الموقع"
          value={currentSettings?.site_name ? 'متصلة' : 'غير مكتملة'}
          icon={SettingsIcon}
          themeKey="settings"
          to="/admin/site_settings"
          hint="تعديل الإعدادات"
        />
      </section>

      <DashboardReports />

      <section className="dashboard-recent-grid" aria-label="آخر التحديثات">
        <RecentList
          title="أحدث المنتجات"
          rows={dashboard.products}
          primaryField="name"
          secondaryField="note"
          emptyText="لا توجد منتجات في قاعدة البيانات بعد."
          to="/admin/products"
        />
        <RecentList
          title="أحدث التصنيفات"
          rows={dashboard.categories}
          primaryField="title"
          secondaryField="description"
          emptyText="لا توجد تصنيفات في قاعدة البيانات بعد."
          to="/admin/categories"
        />
        <RecentList
          title="الفروع"
          rows={dashboard.branches}
          primaryField="name"
          secondaryField="phone"
          emptyText="لا توجد فروع في قاعدة البيانات بعد."
          to="/admin/branches"
        />
        <RecentList
          title="أحدث استفسارات العملاء"
          rows={dashboard.inquiries}
          primaryField="name"
          secondaryField="message"
          emptyText="لا توجد استفسارات جديدة بعد."
          to="/admin/inquiries"
        />
      </section>
    </div>
  );
};
