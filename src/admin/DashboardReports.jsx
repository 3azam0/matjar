import { useEffect, useState, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LabelList,
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import InventoryIcon from '@mui/icons-material/Inventory';
import EmailIcon from '@mui/icons-material/Email';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from '../lib/supabase';
import './DashboardReports.css';

/* ─── Palette ─── */
const COLORS = [
  '#b38e4d', '#6d8b4e', '#c17832', '#2a8f8f',
  '#8b5a9b', '#d4bc8d', '#d32f2f', '#4a90d9',
  '#e8a838', '#5c4033',
];

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, icon: Icon, color, suffix = '' }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="rep-kpi" style={{ '--kpi-color': color }}>
      <div className="rep-kpi__icon"><Icon /></div>
      <div className="rep-kpi__body">
        <p className="rep-kpi__value">
          {typeof value === 'number' ? animated : value}{suffix}
        </p>
        <p className="rep-kpi__label">{label}</p>
      </div>
    </div>
  );
}

/* ─── Panel wrapper ─── */
function ChartPanel({ title, icon: Icon, children, className = '', action }) {
  return (
    <article className={`report-panel ${className}`}>
      <header className="report-panel__head">
        <div className="report-panel__head-left">
          <div className="report-panel__icon"><Icon /></div>
          <h3 className="report-panel__title">{title}</h3>
        </div>
        {action && <div className="report-panel__action">{action}</div>}
      </header>
      <div className="report-panel__body">{children}</div>
    </article>
  );
}

/* ─── Custom tooltip ─── */
function CustomTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="report-tooltip">
      <p className="report-tooltip__label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="report-tooltip__value" style={{ color: entry.color || '#b38e4d' }}>
          {entry.name}: <strong>{entry.value}{suffix}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── Donut center label — rendered as PieChart child ─── */
function DonutCenterLabel({ cx, cy, total }) {
  if (cx == null || cy == null) return null;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-0.4em" style={{ fontSize: 22, fontWeight: 800, fill: '#5c4033', fontFamily: 'inherit' }}>
        {total}
      </tspan>
      <tspan x={cx} dy="1.5em" style={{ fontSize: 11, fill: '#9a8a7e', fontFamily: 'inherit', fontWeight: 600 }}>
        رابط
      </tspan>
    </text>
  );
}

/* ════════════════════════════════════════
   Data fetchers
════════════════════════════════════════ */
async function fetchAll() {
  const [
    { data: products },
    { data: categories },
    { data: branches },
    { data: features },
    { data: links },
    { data: settings },
    { data: inquiries },
  ] = await Promise.all([
    supabase.from('products').select('id, name, category_id, created_at').order('created_at'),
    supabase.from('categories').select('id, title'),
    supabase.from('branches').select('id, name'),
    supabase.from('features').select('id'),
    supabase.from('branch_links').select('id, branch_id'),
    supabase.from('site_settings').select('*').limit(1),
    supabase.from('inquiries').select('id, name, email, phone, message, created_at').order('created_at'),
  ]);

  return { products, categories, branches, features, links, settings, inquiries };
}

function deriveData({ products = [], categories = [], branches = [], features = [], links = [], settings = [], inquiries = [] }) {
  const catMap = Object.fromEntries((categories || []).map(c => [c.id, c.title]));

  /* Products by category */
  const catCounts = {};
  (products || []).forEach(p => {
    const name = catMap[p.category_id] || 'بدون تصنيف';
    catCounts[name] = (catCounts[name] || 0) + 1;
  });
  const productsByCat = Object.entries(catCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  /* Top category */
  const topCat = productsByCat[0]?.name || '—';

  /* Products growth over time (monthly) */
  const monthlyProducts = {};
  (products || []).forEach(p => {
    if (!p.created_at) return;
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('ar-EG', { month: 'short', year: '2-digit' });
    if (!monthlyProducts[key]) monthlyProducts[key] = { key, name: label, count: 0 };
    monthlyProducts[key].count++;
  });
  // cumulative
  let cum = 0;
  const productGrowth = Object.values(monthlyProducts)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(m => { cum += m.count; return { ...m, total: cum }; });

  /* Inquiry trend (monthly → daily fallback) */
  const inqGrouped = {};
  (inquiries || []).forEach(inq => {
    const d = new Date(inq.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('ar-EG', { month: 'short', year: '2-digit' });
    if (!inqGrouped[key]) inqGrouped[key] = { key, name: label, count: 0 };
    inqGrouped[key].count++;
  });
  let inquiryTrend = Object.values(inqGrouped).sort((a, b) => a.key.localeCompare(b.key));
  if (inquiryTrend.length < 2) {
    const daily = {};
    (inquiries || []).forEach(inq => {
      const d = new Date(inq.created_at);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
      if (!daily[key]) daily[key] = { key, name: label, count: 0 };
      daily[key].count++;
    });
    inquiryTrend = Object.values(daily).sort((a, b) => a.key.localeCompare(b.key));
  }

  /* Completeness */
  const complete = [
    { name: 'التصنيفات', value: (categories || []).length, target: 5, fill: '#6d8b4e' },
    { name: 'الفروع', value: (branches || []).length, target: 3, fill: '#c17832' },
    { name: 'المميزات', value: (features || []).length, target: 4, fill: '#2a8f8f' },
    { name: 'الروابط', value: (links || []).length, target: 5, fill: '#8b5a9b' },
    { name: 'الإعدادات', value: settings?.[0]?.site_name ? 1 : 0, target: 1, fill: '#5c4033' },
  ].map(c => ({ ...c, pct: Math.min(100, Math.round((c.value / c.target) * 100)) }));

  const overallPct = Math.round(complete.reduce((s, c) => s + c.pct, 0) / complete.length);

  /* Branch links pie */
  const linkCounts = {};
  (links || []).forEach(l => { linkCounts[l.branch_id] = (linkCounts[l.branch_id] || 0) + 1; });
  const branchPie = (branches || []).map((b, i) => ({
    name: b.name, links: linkCounts[b.id] || 0, fill: COLORS[i % COLORS.length],
  }));
  const totalLinks = (links || []).length;

  return { productsByCat, topCat, productGrowth, inquiryTrend, complete, overallPct, branchPie, totalLinks };
}

/* ─── CSV export ─── */
function exportInquiriesCSV(inquiries) {
  if (!inquiries?.length) return;
  const headers = ['المعرف', 'الاسم', 'البريد', 'الهاتف', 'الرسالة', 'التاريخ'];
  const rows = inquiries.map(i => [
    i.id, i.name, i.email, i.phone,
    `"${(i.message || '').replace(/"/g, '""')}"`,
    new Date(i.created_at).toLocaleString('ar-EG'),
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'inquiries.csv'; a.click();
  URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════
   Main component
════════════════════════════════════════ */
export function DashboardReports() {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAll()
      .then(data => { if (mounted) { setRaw(data); setLoading(false); } })
      .catch(err => { console.error('Reports:', err); if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [refreshKey]);

  const d = useMemo(() => (raw ? deriveData(raw) : null), [raw]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <section className="dashboard-reports" aria-label="التقارير">
        <div className="dashboard-reports__header">
          <h2 className="dashboard-reports__title">📊 التقارير والإحصائيات</h2>
        </div>
        <div className="rep-kpi-row">
          {[1,2,3,4].map(i => <div key={i} className="report-shimmer rep-shimmer-kpi" />)}
        </div>
        <div className="dashboard-reports__grid">
          {[1,2,3,4,5].map(i => <div key={i} className="report-shimmer" />)}
        </div>
      </section>
    );
  }

  if (!d) return null;

  /* ── KPI values ── */
  const kpis = [
    { label: 'إجمالي المنتجات', value: (raw?.products || []).length, icon: InventoryIcon, color: '#b38e4d' },
    { label: 'إجمالي الاستفسارات', value: (raw?.inquiries || []).length, icon: EmailIcon, color: '#d32f2f' },
    { label: 'التصنيفات النشطة', value: (raw?.categories || []).length, icon: CategoryIcon, color: '#6d8b4e' },
    { label: 'اكتمال المحتوى', value: d.overallPct, icon: CheckCircleIcon, color: '#2a8f8f', suffix: '%' },
  ];

  return (
    <section className="dashboard-reports" aria-label="التقارير">
      {/* Section header */}
      <header className="dashboard-reports__header">
        <div>
          <h2 className="dashboard-reports__title">📊 التقارير والإحصائيات</h2>
          <p className="dashboard-reports__subtitle">نظرة شاملة على أداء المحتوى والنشاط</p>
        </div>
        <button
          className="rep-refresh-btn"
          onClick={() => setRefreshKey(k => k + 1)}
          title="تحديث البيانات"
        >
          <RefreshIcon />
          تحديث
        </button>
      </header>

      {/* KPI row */}
      <div className="rep-kpi-row">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts grid */}
      <div className="dashboard-reports__grid">

        {/* 1. Products by Category — horizontal bar */}
        <ChartPanel title="المنتجات حسب التصنيف" icon={AssessmentIcon} className="report-panel--wide">
          {d.productsByCat.length === 0 ? (
            <p className="report-panel__empty">لا توجد بيانات منتجات بعد</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, d.productsByCat.length * 52)}>
              <BarChart
                data={d.productsByCat}
                layout="vertical"
                margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="hBarGold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#c9a227" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#b38e4d" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(92,64,51,0.08)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b5b4f' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#5c4033', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(179,142,77,0.06)' }} />
                <Bar dataKey="count" name="عدد المنتجات" fill="url(#hBarGold)" radius={[0, 8, 8, 0]} maxBarSize={32}>
                  <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontWeight: 800, fill: '#5c4033' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        {/* 2. Products growth over time */}
        <ChartPanel title="نمو المنتجات عبر الزمن" icon={TimelineIcon} className="report-panel--wide">
          {d.productGrowth.length === 0 ? (
            <p className="report-panel__empty">لا توجد بيانات كافية</p>
          ) : d.productGrowth.length === 1 ? (
            /* Single month — show a callout card instead of a flat line */
            <div className="rep-single-stat">
              <span className="rep-single-stat__val" style={{ color: '#6d8b4e' }}>{d.productGrowth[0].total}</span>
              <span className="rep-single-stat__label">منتج مضاف في {d.productGrowth[0].name}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={d.productGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d8b4e" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#6d8b4e" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(92,64,51,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b5b4f' }} axisLine={{ stroke: 'rgba(92,64,51,0.12)' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b5b4f' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="إجمالي المنتجات"
                  stroke="#6d8b4e" strokeWidth={2.5} fill="url(#growthGrad)"
                  dot={{ fill: '#6d8b4e', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        {/* 3. Inquiry Trend */}
        <ChartPanel
          title="اتجاه الاستفسارات"
          icon={TrendingUpIcon}
          className="report-panel--wide"
          action={
            <button className="rep-export-btn" onClick={() => exportInquiriesCSV(raw?.inquiries)} title="تصدير CSV">
              <DownloadIcon />
              تصدير CSV
            </button>
          }
        >
          {d.inquiryTrend.length === 0 ? (
            <p className="report-panel__empty">لا توجد استفسارات مسجلة بعد</p>
          ) : d.inquiryTrend.length === 1 ? (
            <div className="rep-single-stat">
              <span className="rep-single-stat__val" style={{ color: '#d32f2f' }}>{d.inquiryTrend[0].count}</span>
              <span className="rep-single-stat__label">استفسار في {d.inquiryTrend[0].name}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={d.inquiryTrend} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="inqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d32f2f" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d32f2f" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(92,64,51,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b5b4f' }} axisLine={{ stroke: 'rgba(92,64,51,0.12)' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b5b4f' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="استفسارات"
                  stroke="#d32f2f" strokeWidth={2.5} fill="url(#inqGrad)"
                  dot={{ fill: '#d32f2f', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        {/* 4. Content Completeness */}
        <ChartPanel title="اكتمال المحتوى" icon={DonutLargeIcon}>
          <div className="report-completeness">
            <div className="report-completeness__ring">
              <svg viewBox="0 0 120 120" className="report-ring-svg">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c9a227" />
                    <stop offset="100%" stopColor="#b38e4d" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(92,64,51,0.08)" strokeWidth="11" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#ringGrad)" strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={`${(d.overallPct / 100) * 314} 314`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
                />
                <text x="60" y="54" textAnchor="middle" className="report-ring-pct">{d.overallPct}%</text>
                <text x="60" y="70" textAnchor="middle" className="report-ring-label">مكتمل</text>
              </svg>
            </div>
            <ul className="report-completeness__list">
              {d.complete.map(item => (
                <li key={item.name} className="report-completeness__item">
                  <span className="report-completeness__dot" style={{ background: item.fill }} />
                  <span className="report-completeness__name">{item.name}</span>
                  <span className="report-completeness__bar-wrap">
                    <span className="report-completeness__bar-fill"
                      style={{ width: `${item.pct}%`, background: item.fill }} />
                  </span>
                  <span className="report-completeness__nums">
                    {item.value}<span className="report-completeness__target">/{item.target}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ChartPanel>

        {/* 5. Branch Links Donut */}
        <ChartPanel title="توزيع روابط الفروع" icon={PieChartIcon}>
          {d.branchPie.length === 0 ? (
            <p className="report-panel__empty">لا توجد فروع مسجلة بعد</p>
          ) : (
            <div className="report-pie-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={d.branchPie} dataKey="links" nameKey="name"
                    cx="50%" cy="50%" innerRadius={52} outerRadius={88}
                    paddingAngle={d.totalLinks > 0 ? 3 : 0} strokeWidth={0}
                    label={false}
                  >
                    {d.branchPie.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <DonutCenterLabel cx={110} cy={110} total={d.totalLinks} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0];
                      return (
                        <div className="report-tooltip">
                          <p className="report-tooltip__label">{p.name}</p>
                          <p className="report-tooltip__value" style={{ color: p.payload.fill }}>
                            الروابط: <strong>{p.value}</strong>
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="report-pie-legend">
                {d.branchPie.map((b, i) => (
                  <li key={i} className="report-pie-legend__item">
                    <span className="report-pie-legend__dot" style={{ background: b.fill }} />
                    <span className="report-pie-legend__name">{b.name}</span>
                    <span className="report-pie-legend__bar-wrap">
                      <span className="report-pie-legend__bar" style={{
                        width: d.totalLinks ? `${(b.links / d.totalLinks) * 100}%` : '0%',
                        background: b.fill,
                      }} />
                    </span>
                    <span className="report-pie-legend__val">{b.links} رابط</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartPanel>

      </div>
    </section>
  );
}
