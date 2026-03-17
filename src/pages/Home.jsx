import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';
import SeoContentSection from '../components/SeoContentSection';

/* ── helpers ── */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const CATEGORY_SECTIONS = [
  { key: 'Electronics',      title: 'Electronics',           subtitle: 'Gadgets & Accessories',   emoji: '💻', color: '#1e3a5f' },
  { key: 'Mobiles',          title: 'Mobiles',               subtitle: 'Smartphones & More',      emoji: '📱', color: '#1a237e' },
  { key: 'Fashion',          title: 'Fashion',               subtitle: 'Style Picks',             emoji: '👗', color: '#4a148c' },
  { key: 'Home & Furniture', title: 'Home & Furniture',      subtitle: 'For Your Home',           emoji: '🛋️', color: '#1b5e20' },
  { key: 'Appliances',       title: 'Appliances',            subtitle: 'Kitchen & More',          emoji: '📺', color: '#e65100' },
  { key: 'Sports',           title: 'Sports & Fitness',      subtitle: 'Stay Active',             emoji: '🏋️', color: '#006064' },
  { key: 'Books',            title: 'Books',                 subtitle: 'Read & Learn',            emoji: '📚', color: '#37474f' },
  { key: 'Beauty',           title: 'Beauty & Personal Care',subtitle: 'Look Great',             emoji: '💄', color: '#880e4f' },
  { key: 'Grocery',          title: 'Grocery',               subtitle: 'Daily Essentials',        emoji: '🛒', color: '#2e7d32' },
];

const NAV_CATS = [
  { name: 'All Products',    icon: '🏠',  path: '/shop' },
  { name: 'Mobiles',         icon: '📱',  path: '/shop/category/Mobiles' },
  { name: 'Electronics',     icon: '💻',  path: '/shop/category/Electronics' },
  { name: 'Fashion',         icon: '👕',  path: '/shop/category/Fashion' },
  { name: 'Home & Furniture',icon: '🛋️', path: '/shop/category/Home & Furniture' },
  { name: 'Appliances',      icon: '📺',  path: '/shop/category/Appliances' },
  { name: 'Sports',          icon: '🏋️', path: '/shop/category/Sports' },
  { name: 'Beauty',          icon: '💄',  path: '/shop/category/Beauty' },
  { name: 'Grocery',         icon: '🛒',  path: '/shop/category/Grocery' },
  { name: 'Travel',          icon: '✈️',  path: '/shop/category/Travel' },
  { name: 'Books',           icon: '📚',  path: '/shop/category/Books' },
];

const banners = [
  ...Array.from({ length: 3 }, (_, i) => `https://picsum.photos/seed/hbanner${i + 1}/1600/420`),
  `${API_BASE_URL}/uploads/banners/electronics_sale_banner.png`,
  ...Array.from({ length: 4 }, (_, i) => `https://picsum.photos/seed/hbanner${i + 5}/1600/420`)
];

/* ── ProductRow: horizontal scroll strip ── */
const ProductRow = ({ products, catKey }) => (
  <div className="prod-row">
    {products.slice(0, 10).map(p => (
      <ProductCard key={p._id} product={p} className="deal-card" />
    ))}
  </div>
);

/* ── Skeleton loader ── */
const SkeletonRow = () => (
  <div className="prod-row">
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="sk-img" />
        <div className="sk-txt l" />
        <div className="sk-txt m" />
        <div className="sk-txt s" />
      </div>
    ))}
  </div>
);

/* ══════════════════ Home ══════════════════ */
const Home = () => {
  const [allProducts, setAllProducts]   = useState([]);
  const [loading,     setLoading]       = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);

  /* fetch ALL products (up to 200 for section variety) */
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products?limit=200`);
        const list = Array.isArray(data) ? data : (data.products || []);
        setAllProducts(list);
      } catch (e) {
        console.error('Products fetch error:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  /* banner auto-advance */
  useEffect(() => {
    const t = setInterval(() => setActiveBanner(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, []);

  /* derive sections */
  const topDeals        = shuffle(allProducts).slice(0, 12);
  const newArrivals     = [...allProducts].reverse().slice(0, 12);
  const byCat = (cat)  => allProducts.filter(p => p.category === cat);

  return (
    <div className="hp-wrap">

      {/* ── Category nav bar ── */}
      <div className="hp-catbar">
        <div className="container hp-catinner">
          {NAV_CATS.map(c => (
            <Link key={c.name} to={c.path} className="hp-catitem">
              <span className="hp-caticon">{c.icon}</span>
              <span className="hp-catname">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container">

        {/* ── Hero slider ── */}
        <div className="hp-hero">
          <div className="hp-herotrack" style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
            {banners.map((b, i) => <img key={i} src={b} alt="" loading="lazy" />)}
          </div>
          <div className="hp-dots">
            {banners.map((_, i) => (
              <span key={i} className={`hp-dot${activeBanner === i ? ' a' : ''}`} onClick={() => setActiveBanner(i)} />
            ))}
          </div>
        </div>

        {/* ── Top Deals ── */}
        <div className="hp-section">
          <div className="hp-sec-head">
            <div>
              <h2 className="hp-sec-title">Top Deals</h2>
              <p className="hp-sec-sub">Best offers handpicked for you{topDeals.length > 0 ? ` · ${topDeals.length} items` : ''}</p>
            </div>
            <Link to="/shop" className="hp-viewall">VIEW ALL</Link>
          </div>
          {loading ? <SkeletonRow /> : topDeals.length > 0
            ? <ProductRow products={topDeals} catKey="top" />
            : <div className="hp-empty">Products loading — please refresh in a moment.</div>
          }
        </div>

        {/* ── New Arrivals ── */}
        <div className="hp-section">
          <div className="hp-sec-head">
            <div>
              <h2 className="hp-sec-title">🆕 New Arrivals</h2>
              <p className="hp-sec-sub">Fresh additions to our store</p>
            </div>
            <Link to="/shop?sort=newest" className="hp-viewall">VIEW ALL</Link>
          </div>
          {loading ? <SkeletonRow /> : newArrivals.length > 0
            ? <ProductRow products={newArrivals} />
            : null
          }
        </div>

        {/* ── Category Sections ── */}
        {CATEGORY_SECTIONS.map(sec => {
          const items = byCat(sec.key);
          if (!loading && items.length === 0) return null;
          return (
            <div key={sec.key} className="hp-section">
              <div className="hp-sec-head">
                <div className="hp-sec-badge" style={{ borderLeft: `4px solid ${sec.color}` }}>
                  <h2 className="hp-sec-title">{sec.emoji} {sec.title}</h2>
                  <p className="hp-sec-sub">{sec.subtitle}{items.length > 0 ? ` · ${items.length} items` : ''}</p>
                </div>
                <Link to={`/shop/category/${encodeURIComponent(sec.key)}`} className="hp-viewall">VIEW ALL</Link>
              </div>
              {loading ? <SkeletonRow /> : <ProductRow products={items} catKey={sec.key} />}
            </div>
          );
        })}

      </div>{/* /container */}

      <SeoContentSection />

      <style>{`
        /* ── Base ─────────────────────────────────────── */
        .hp-wrap { background:#f1f3f6; min-height:100vh; padding-bottom:3rem; overflow-x:hidden; }

        /* ── Category bar ─────────────────────────────── */
        .hp-catbar { background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.1); padding:.65rem 0; margin-bottom:.75rem; }
        .hp-catinner { display:flex; gap:0; overflow-x:auto; scrollbar-width:none; justify-content:space-around; }
        .hp-catinner::-webkit-scrollbar { display:none; }
        .hp-catitem { display:flex; flex-direction:column; align-items:center; min-width:70px; padding:.4rem .6rem; text-decoration:none; transition:transform .2s; flex-shrink:0; }
        .hp-catitem:hover { transform:translateY(-3px); }
        .hp-caticon { font-size:2rem; margin-bottom:.3rem; filter:drop-shadow(0 1px 3px rgba(0,0,0,.12)); }
        .hp-catname { font-size:.7rem; font-weight:600; color:#212121; text-align:center; line-height:1.2; }

        /* ── Hero ─────────────────────────────────────── */
        .hp-hero { height:270px; overflow:hidden; position:relative; margin-bottom:.75rem; box-shadow:0 1px 2px rgba(0,0,0,.1); }
        .hp-herotrack { display:flex; height:100%; transition:transform .6s ease; }
        .hp-herotrack img { min-width:100%; height:100%; object-fit:cover; }
        .hp-dots { position:absolute; bottom:12px; left:50%; transform:translateX(-50%); display:flex; gap:6px; }
        .hp-dot { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,.55); cursor:pointer; transition:all .3s; }
        .hp-dot.a { background:#fff; width:22px; border-radius:4px; }

        /* ── Section card ─────────────────────────────── */
        .hp-section { background:#fff; padding:1rem 1.25rem 1.25rem; box-shadow:0 1px 2px rgba(0,0,0,.1); margin-bottom:.75rem; }
        .hp-sec-head { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f0f0f0; padding-bottom:.9rem; margin-bottom:1rem; }
        .hp-sec-badge { padding-left:.75rem; }
        .hp-sec-title { font-size:1.3rem; color:#212121; margin:0; font-weight:500; }
        .hp-sec-sub { color:#878787; font-size:.82rem; margin:.25rem 0 0; }
        .hp-viewall { background:#2874f0; color:#fff !important; padding:.45rem 1.25rem; border-radius:2px; font-weight:600; text-decoration:none; font-size:.82rem; text-transform:uppercase; letter-spacing:.4px; transition:background .2s; white-space:nowrap; flex-shrink:0; }
        .hp-viewall:hover { background:#1c5bbf; }
        .hp-empty { padding:2rem; text-align:center; color:#878787; font-size:.9rem; }

        /* ── Horizontal product row ───────────────────── */
        .prod-row { display:flex; gap:.85rem; overflow-x:auto; padding-bottom:.75rem; scrollbar-width:thin; scrollbar-color:#e0e0e0 transparent; }
        .prod-row::-webkit-scrollbar { height:5px; }
        .prod-row::-webkit-scrollbar-track { background:#f5f5f5; }
        .prod-row::-webkit-scrollbar-thumb { background:#d0d0d0; border-radius:10px; }

        /* ── deal-card (ProductCard home variant) ─────── */
        .deal-card { text-decoration:none; color:inherit; text-align:center; padding:1.1rem .9rem 1rem; border:1px solid #f0f0f0; border-radius:6px; transition:all .35s cubic-bezier(.175,.885,.32,1.275); background:#fff; display:flex; flex-direction:column; align-items:center; position:relative; overflow:hidden; min-width:155px; max-width:155px; flex-shrink:0; }
        .deal-card:hover { transform:translateY(-8px); box-shadow:0 12px 28px rgba(0,0,0,.12); border-color:transparent; z-index:1; }
        .deal-image { height:150px; width:100%; display:flex; align-items:center; justify-content:center; margin-bottom:.75rem; position:relative; }
        .deal-image img { max-width:100%; max-height:100%; object-fit:contain; transition:transform .4s ease; }
        .deal-card:hover .deal-image img { transform:scale(1.08); }
        .deal-info { width:100%; }
        .deal-name { font-weight:600; color:#212121; margin-bottom:.35rem; font-size:.82rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; transition:color .3s; }
        .deal-card:hover .deal-name { color:#2874f0; }
        .deal-price { color:#388e3c; font-weight:700; font-size:.95rem; margin-bottom:.2rem; }
        .deal-brand { color:#878787; font-size:.73rem; }
        .card-image-indicators { position:absolute; bottom:5px; left:50%; transform:translateX(-50%); display:flex; gap:3px; background:rgba(0,0,0,.28); border-radius:10px; padding:3px 6px; }
        .card-indicator-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.6); transition:all .3s; }
        .card-indicator-dot.active { background:#fff; width:8px; height:8px; }

        /* ── Skeleton loader ──────────────────────────── */
        .skeleton-card { min-width:155px; max-width:155px; flex-shrink:0; border:1px solid #f0f0f0; border-radius:6px; padding:1.1rem .9rem; display:flex; flex-direction:column; align-items:center; gap:.6rem; }
        .sk-img { width:100%; height:140px; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200%; animation:shimmer 1.4s infinite; border-radius:4px; }
        .sk-txt { height:10px; border-radius:4px; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200%; animation:shimmer 1.4s infinite; }
        .sk-txt.l { width:85%; }
        .sk-txt.m { width:55%; }
        .sk-txt.s { width:40%; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── Responsive ───────────────────────────────── */
        @media (max-width:768px) {
          .hp-hero { height:170px; }
          .deal-card { min-width:130px; max-width:130px; }
          .deal-image { height:120px; }
          .hp-section { padding:.75rem; }
          .hp-sec-title { font-size:1.1rem; }
        }
      `}</style>
    </div>
  );
};

export default Home;
