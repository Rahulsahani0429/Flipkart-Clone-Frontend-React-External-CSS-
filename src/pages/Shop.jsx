import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';
import CategoryBanner from '../components/CategoryBanner';

const TOP_CAT_BAR = [
  { name: 'All',              icon: '🏠', path: '/shop' },
  { name: 'Mobiles',          icon: '📱', path: '/shop/category/Mobiles' },
  { name: 'Electronics',      icon: '💻', path: '/shop/category/Electronics' },
  { name: 'Fashion',          icon: '👕', path: '/shop/category/Fashion' },
  { name: 'Home & Furniture', icon: '🛋️', path: '/shop/category/Home & Furniture' },
  { name: 'Appliances',       icon: '📺', path: '/shop/category/Appliances' },
  { name: 'Grocery',          icon: '🛒', path: '/shop/category/Grocery' },
  { name: 'Sports',           icon: '🏋️', path: '/shop/category/Sports' },
  { name: 'Beauty',           icon: '💄', path: '/shop/category/Beauty' },
  { name: 'Wearables',        icon: '⌚', path: '/shop/category/Wearables' },
  { name: 'Travel',           icon: '✈️', path: '/shop/category/Travel' },
  { name: 'Books',            icon: '📚', path: '/shop/category/Books' },
];

const PRICE_RANGES = [
  { label: 'Under ₹1,000',          value: 'under1000',    min: '',       max: '1000' },
  { label: '₹1,000 – ₹2,000',      value: '1000-2000',    min: '1000',   max: '2000' },
  { label: '₹2,000 – ₹5,000',      value: '2000-5000',    min: '2000',   max: '5000' },
  { label: '₹5,000 – ₹10,000',     value: '5000-10000',   min: '5000',   max: '10000' },
  { label: '₹10,000 – ₹20,000',    value: '10000-20000',  min: '10000',  max: '20000' },
  { label: '₹20,000 – ₹50,000',    value: '20000-50000',  min: '20000',  max: '50000' },
  { label: '₹50,000 – ₹1,00,000',  value: '50000-100000', min: '50000',  max: '100000' },
  { label: 'Above ₹1,00,000',       value: 'above100000',  min: '100000', max: '' },
];

const SORT_OPTIONS = [
  { label: 'Relevance',         value: '' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Highest Rated',     value: 'rating' },
  { label: 'Newest First',      value: 'newest' },
];

// Legacy banners moved to CategoryBanner component

const Shop = () => {
  const { categoryName, brandName } = useParams();
  const { search } = useLocation();
  const navigate   = useNavigate();

  const [filters, setFilters] = useState({
    category: '', subcategory: '', brand: '', priceRange: '', sort: '', page: 1, keyword: '',
  });

  const [products,      setProducts]      = useState([]);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [brands,        setBrands]        = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [showFilters,   setShowFilters]   = useState(false);
  const [openSections,  setOpenSections]  = useState({ categories: true, price: true, brand: true });

  /* sync URL -> state */
  useEffect(() => {
    const sp = new URLSearchParams(search);
    setFilters({
      category:    categoryName  || sp.get('category')    || '',
      subcategory: sp.get('subcategory') || '',
      brand:       brandName     || sp.get('brand')        || '',
      priceRange:  sp.get('priceRange') || '',
      sort:        sp.get('sort')       || '',
      page:        Number(sp.get('page')) || 1,
      keyword:     sp.get('keyword')    || '',
    });
  }, [categoryName, brandName, search]);

  /* fetch products */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true); setError(null);
        const p = new URLSearchParams();
        if (filters.keyword)  p.set('keyword',  filters.keyword);
        if (filters.category) p.set('category', filters.category);
        if (filters.subcategory) p.set('subcategory', filters.subcategory);
        if (filters.brand)    p.set('brand',    filters.brand);
        if (filters.sort)     p.set('sort',     filters.sort);
        p.set('page', String(filters.page));
        p.set('limit', '24');
        const pr = PRICE_RANGES.find(r => r.value === filters.priceRange);
        if (pr?.min) p.set('minPrice', pr.min);
        if (pr?.max) p.set('maxPrice', pr.max);

        const { data } = await axios.get(`${API_BASE_URL}/api/products?${p}`);
        if (Array.isArray(data)) {
          setProducts(data); setTotalProducts(data.length); setTotalPages(1);
        } else {
          setProducts(data.products || []); setTotalProducts(data.total || 0); setTotalPages(data.pages || 1);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally { setLoading(false); }
    };
    run();
  }, [filters]);

  /* fetch brands scoped to category */
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products/brands${filters.category ? '?category=' + encodeURIComponent(filters.category) : ''}`)
      .then(r => setBrands(Array.isArray(r.data) ? r.data : []))
      .catch(() => setBrands([]));
  }, [filters.category]);

  /* fetch all categories */
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products/categories`)
      .then(r => setAllCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAllCategories([]));
  }, []);

  /* banner rotate logic moved to CategoryBanner */

  /* navigate helper */
  const go = useCallback((cat, sub, br, price, sort, page) => {
    const c  = cat   !== undefined ? cat   : filters.category;
    const sbc = sub   !== undefined ? sub   : filters.subcategory;
    const b  = br    !== undefined ? br    : filters.brand;
    const pr = price !== undefined ? price : filters.priceRange;
    const s  = sort  !== undefined ? sort  : filters.sort;
    const pg = page  !== undefined ? page  : 1;

    let path = '/shop';
    const sp = new URLSearchParams();
    if (c) { path = `/shop/category/${encodeURIComponent(c)}`; if (b) sp.set('brand', b); }
    else if (b) { path = `/shop/brand/${encodeURIComponent(b)}`; }
    
    if (sbc) sp.set('subcategory', sbc);
    if (pr) sp.set('priceRange', pr);
    if (s)  sp.set('sort', s);
    if (pg > 1) sp.set('page', String(pg));
    const qs = sp.toString();
    navigate(`${path}${qs ? '?' + qs : ''}`);
  }, [filters, navigate]);

  const setCategory      = c   => go(c, '', '', filters.priceRange, filters.sort, 1);
  const setSubcategory   = sub => go(filters.category, sub, filters.brand, filters.priceRange, filters.sort, 1);
  const setBrand         = b   => go(filters.category, filters.subcategory, b, filters.priceRange, filters.sort, 1);
  const setPriceRange    = pr  => go(filters.category, filters.subcategory, filters.brand, pr,    filters.sort, 1);
  const setSort          = s   => go(filters.category, filters.subcategory, filters.brand, filters.priceRange, s, 1);
  const setPage          = pg  => go(filters.category, filters.subcategory, filters.brand, filters.priceRange, filters.sort, pg);
  const clearAll      = () => navigate('/shop');

  const toggleSection = key => setOpenSections(p => ({ ...p, [key]: !p[key] }));
  const activeCount = (filters.category ? 1 : 0) + (filters.brand ? 1 : 0) + (filters.priceRange ? 1 : 0);

  return (
    <div className="shop-wrapper">

      {/* Category bar */}
      <div className="shop-cat-bar">
        <div className="container shop-cat-inner">
          {TOP_CAT_BAR.map(cat => (
            <Link key={cat.name} to={cat.path}
              className={`shop-cat-item${filters.category === cat.name || (!filters.category && cat.name === 'All') ? ' active' : ''}`}
            >
              <span className="sci">{cat.icon}</span>
              <span className="scn">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Dynamic Category Hero Banner */}
        <CategoryBanner category={filters.category} />

        {/* Breadcrumb */}
        {(filters.category || filters.subcategory || filters.brand) && (
          <div className="shop-bc">
            <Link to="/shop">Home</Link>
            {filters.category && <><span>/</span><span>{filters.category}</span></>}
            {filters.subcategory && <><span>/</span><span>{filters.subcategory}</span></>}
            {filters.brand    && <><span>/</span><span>{filters.brand}</span></>}
            <strong>· {totalProducts} items</strong>
          </div>
        )}

        <div className="shop-body">
          {/* Mobile toggle */}
          <div className="mob-filter-btn" onClick={() => setShowFilters(true)}>
            🔍 Filters {activeCount > 0 ? `(${activeCount})` : ''}
          </div>

          {/* Sidebar */}
          <aside className={`shop-sidebar${showFilters ? ' open' : ''}`}>
            <div className="ssb-head">
              <span className="ssb-title">
                Filters {activeCount > 0 && <em className="ssb-badge">{activeCount}</em>}
              </span>
              <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
                {activeCount > 0 && <button className="ssb-clear" onClick={clearAll}>CLEAR ALL</button>}
                <button className="ssb-close" onClick={() => setShowFilters(false)}>✕</button>
              </div>
            </div>

            {activeCount > 0 && (
              <div className="ssb-chips">
                {filters.category && <span className="ssb-chip">{filters.category} <button onClick={() => setCategory('')}>✕</button></span>}
                {filters.subcategory && <span className="ssb-chip">{filters.subcategory} <button onClick={() => setSubcategory('')}>✕</button></span>}
                {filters.brand    && <span className="ssb-chip">{filters.brand} <button onClick={() => setBrand('')}>✕</button></span>}
                {filters.priceRange && <span className="ssb-chip">{PRICE_RANGES.find(r => r.value === filters.priceRange)?.label} <button onClick={() => setPriceRange('')}>✕</button></span>}
              </div>
            )}

            {/* Categories */}
            <div className="ssb-section">
              <button className="ssb-tog" onClick={() => toggleSection('categories')}>
                CATEGORIES <span>{openSections.categories ? '▲' : '▼'}</span>
              </button>
              {openSections.categories && (
                <div className="ssb-body">
                  {allCategories.map(cat => (
                    <label key={cat} className="ssb-row">
                      <input type="checkbox" checked={filters.category === cat} onChange={() => setCategory(filters.category === cat ? '' : cat)} />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div className="ssb-section">
                <button className="ssb-tog" onClick={() => toggleSection('brand')}>
                  BRAND <span>{openSections.brand ? '▲' : '▼'}</span>
                </button>
                {openSections.brand && (
                  <div className="ssb-body">
                    {brands.map(br => (
                      <label key={br} className="ssb-row">
                        <input type="checkbox" checked={filters.brand === br} onChange={() => setBrand(filters.brand === br ? '' : br)} />
                        <span>{br}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            <div className="ssb-section">
              <button className="ssb-tog" onClick={() => toggleSection('price')}>
                PRICE <span>{openSections.price ? '▲' : '▼'}</span>
              </button>
              {openSections.price && (
                <div className="ssb-body">
                  {PRICE_RANGES.map(r => (
                    <label key={r.value} className="ssb-row">
                      <input type="checkbox" checked={filters.priceRange === r.value} onChange={() => setPriceRange(filters.priceRange === r.value ? '' : r.value)} />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Product area */}
          <main className="shop-main">
            <div className="shop-topbar">
              <p className="shop-count">
                {loading ? 'Loading…' : `Showing ${totalProducts} products${filters.category ? ' in ' + filters.category : ''}${filters.brand ? ' · ' + filters.brand : ''}`}
              </p>
              <select className="shop-sort" value={filters.sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>Sort By: {s.label}</option>)}
              </select>
            </div>

            {error && <div className="shop-err">⚠️ {error}</div>}

            {!loading && !error && products.length === 0 && (
              <div className="shop-empty">
                <div style={{ fontSize:'3rem' }}>🔍</div>
                <h3>No products found</h3>
                <button className="shop-link" onClick={clearAll}>Clear all filters</button>
              </div>
            )}

            <div className="shop-grid">
              {products.map(p => <ProductCard key={p._id} product={p} className="shop-card" />)}
            </div>

            {totalPages > 1 && (
              <div className="shop-pages">
                <button className="pg-btn" disabled={filters.page <= 1} onClick={() => setPage(filters.page - 1)}>‹ Prev</button>
                {Array.from({ length: Math.min(totalPages, 9) }, (_, i) => {
                  const pg = totalPages <= 9 ? i + 1 : Math.max(1, filters.page - 4) + i;
                  if (pg > totalPages) return null;
                  return <button key={pg} className={`pg-btn${filters.page === pg ? ' pg-active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>;
                })}
                <button className="pg-btn" disabled={filters.page >= totalPages} onClick={() => setPage(filters.page + 1)}>Next ›</button>
              </div>
            )}
          </main>
        </div>
      </div>

      <div className={`shop-overlay${showFilters ? ' show' : ''}`} onClick={() => setShowFilters(false)} />

      <style>{`
        /* ── Base ───────────────────────────────────── */
        .shop-wrapper { background:#f1f3f6; min-height:100vh; padding-bottom:3rem; }

        /* ── Cat Bar ────────────────────────────────── */
        .shop-cat-bar { background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.08); padding:.6rem 0; margin-bottom:.75rem; }
        .shop-cat-inner { display:flex; justify-content:space-around; gap:.4rem; overflow-x:auto; scrollbar-width:none; }
        .shop-cat-inner::-webkit-scrollbar { display:none; }
        .shop-cat-item { display:flex; flex-direction:column; align-items:center; min-width:58px; flex-shrink:0; padding:.35rem .45rem; text-decoration:none; border-bottom:2px solid transparent; transition:transform .18s; }
        .shop-cat-item:hover { transform:translateY(-2px); }
        .shop-cat-item.active { border-bottom-color:#2874f0; }
        .sci { font-size:1.75rem; margin-bottom:.25rem; }
        .scn { font-size:.7rem; font-weight:600; color:#212121; text-align:center; }

        /* ── Hero ───────────────────────────────────── */
        .shop-hero { height:200px; overflow:hidden; position:relative; border-radius:4px; margin-bottom:.75rem; }
        .shop-hero-track { display:flex; height:100%; transition:transform .6s ease; }
        .shop-hero-track img { min-width:100%; height:100%; object-fit:cover; }
        .shop-hero-dots { position:absolute; bottom:9px; left:50%; transform:translateX(-50%); display:flex; gap:5px; }
        .shd { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.5); cursor:pointer; transition:all .3s; }
        .shd.a { background:#fff; width:18px; border-radius:4px; }

        /* ── Breadcrumb ─────────────────────────────── */
        .shop-bc { font-size:.8rem; color:#878787; padding:.35rem 0 .55rem; display:flex; gap:5px; align-items:center; flex-wrap:wrap; }
        .shop-bc a { color:#2874f0; text-decoration:none; }
        .shop-bc strong { color:#212121; }

        /* ── Layout ─────────────────────────────────── */
        .shop-body { display:grid; grid-template-columns:200px 1fr; gap:1rem; align-items:start; }
        .mob-filter-btn { display:none; background:#fff; padding:.7rem; text-align:center; color:#2874f0; font-weight:700; font-size:.85rem; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,.08); margin-bottom:.75rem; cursor:pointer; }

        /* ── Sidebar ────────────────────────────────── */
        .shop-sidebar { background:#fff; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,.08); position:sticky; top:110px; max-height:calc(100vh - 120px); overflow-y:auto; scrollbar-width:thin; }
        .ssb-head { display:flex; justify-content:space-between; align-items:center; padding:.7rem 1rem; border-bottom:1px solid #f0f0f0; position:sticky; top:0; background:#fff; z-index:1; }
        .ssb-title { font-size:.8rem; font-weight:800; color:#212121; display:flex; align-items:center; gap:7px; letter-spacing:.4px; }
        .ssb-badge { background:#2874f0; color:#fff; font-size:.58rem; border-radius:50%; width:15px; height:15px; display:inline-flex; align-items:center; justify-content:center; font-style:normal; font-weight:900; }
        .ssb-clear { background:none; border:none; color:#2874f0; font-size:.7rem; font-weight:700; cursor:pointer; }
        .ssb-close { display:none; background:none; border:none; font-size:1rem; cursor:pointer; color:#666; }
        .ssb-chips { display:flex; flex-wrap:wrap; gap:4px; padding:.45rem 1rem; border-bottom:1px solid #f5f5f5; }
        .ssb-chip { display:inline-flex; align-items:center; gap:3px; background:#e8f0fe; color:#2874f0; border-radius:12px; padding:3px 8px; font-size:.7rem; font-weight:600; }
        .ssb-chip button { background:none; border:none; color:#2874f0; cursor:pointer; font-size:.78rem; padding:0 1px; }
        .ssb-section { border-bottom:1px solid #f0f0f0; }
        .ssb-tog { width:100%; display:flex; justify-content:space-between; align-items:center; background:none; border:none; padding:.6rem 1rem; font-size:.7rem; font-weight:800; color:#212121; letter-spacing:.4px; text-transform:uppercase; cursor:pointer; }
        .ssb-tog:hover { color:#2874f0; }
        .ssb-body { padding:.2rem 1rem .45rem; }
        .ssb-row { display:flex; align-items:center; gap:8px; font-size:.81rem; color:#212121; padding:5px 0; cursor:pointer; }
        .ssb-row:hover { color:#2874f0; }
        .ssb-row input[type="checkbox"] { accent-color:#2874f0; width:14px; height:14px; flex-shrink:0; cursor:pointer; }

        /* ── Product area ───────────────────────────── */
        .shop-main { background:#fff; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,.08); padding:.75rem; }
        .shop-topbar { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f0f0f0; padding-bottom:.55rem; margin-bottom:.75rem; flex-wrap:wrap; gap:.75rem; }
        .shop-count { font-size:.82rem; color:#212121; margin:0; }
        .shop-sort { border:1px solid #d0d0d0; border-radius:4px; padding:.28rem .55rem; font-size:.82rem; cursor:pointer; background:#fff; color:#212121; outline:none; }
        .shop-err { color:#e53e3e; padding:2rem; text-align:center; }
        .shop-empty { text-align:center; padding:3rem 1rem; color:#878787; }
        .shop-empty h3 { margin-bottom:.5rem; color:#212121; }
        .shop-link { background:none; border:none; color:#2874f0; cursor:pointer; text-decoration:underline; font-size:.9rem; }

        /* ── Product Grid ───────────────────────────── */
        .shop-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(165px, 1fr)); gap:1px; background:#f0f0f0; }

        /* ── Shop Card ──────────────────────────────── */
        .shop-card { display:block; text-decoration:none; background:#fff; transition:box-shadow .2s; }
        .shop-card:hover { box-shadow:0 2px 12px rgba(0,0,0,.15); z-index:1; position:relative; }

        .shop-card-image { width:100%; height:175px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:#f9f9f9; position:relative; }
        .shop-card-image img { width:100%; height:100%; object-fit:contain; padding:10px; box-sizing:border-box; transition:transform .3s; }
        .shop-card:hover .shop-card-image img { transform:scale(1.06); }

        .card-image-indicators { position:absolute; bottom:6px; left:50%; transform:translateX(-50%); display:flex; gap:3px; }
        .card-indicator-dot { width:5px; height:5px; border-radius:50%; background:rgba(0,0,0,.22); }
        .card-indicator-dot.active { background:#2874f0; }

        .shop-card-info { padding:.45rem .55rem .6rem; }
        .shop-card-info h3 { font-size:.77rem; color:#212121; font-weight:400; margin:0 0 5px; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:2em; }

        .shop-rating { display:flex; align-items:center; gap:5px; margin-bottom:5px; }
        .rating-badge { display:inline-flex; align-items:center; gap:2px; background:#388e3c; color:#fff; font-size:.67rem; font-weight:700; padding:2px 5px; border-radius:3px; }
        .rating-count { font-size:.7rem; color:#878787; }

        .shop-price-row { display:flex; align-items:center; gap:5px; flex-wrap:wrap; margin-bottom:3px; }
        .price-main { font-size:.93rem; font-weight:700; color:#212121; }
        .flipkart-assured { background:#2874f0; color:#fff; font-size:.58rem; font-weight:700; padding:2px 5px; border-radius:3px; letter-spacing:.2px; }

        .shop-brand { font-size:.7rem; color:#878787; margin:0; }

        /* ── Pagination ─────────────────────────────── */
        .shop-pages { display:flex; justify-content:center; gap:.3rem; padding-top:1.2rem; flex-wrap:wrap; }
        .pg-btn { padding:.36rem .62rem; border:1px solid #d0d0d0; border-radius:4px; background:#fff; color:#212121; cursor:pointer; font-size:.8rem; min-width:34px; transition:all .15s; }
        .pg-btn:hover:not(:disabled) { border-color:#2874f0; color:#2874f0; }
        .pg-btn:disabled { opacity:.35; cursor:not-allowed; }
        .pg-active { background:#2874f0 !important; color:#fff !important; border-color:#2874f0 !important; font-weight:700; }

        /* ── Overlay ─────────────────────────────────── */
        .shop-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:2000; }
        .shop-overlay.show { display:block; }

        /* ── Responsive ─────────────────────────────── */
        @media (max-width:1024px) { .shop-body { grid-template-columns:180px 1fr; } }
        @media (max-width:768px) {
          .shop-body { grid-template-columns:1fr; }
          .mob-filter-btn { display:block; }
          .ssb-close { display:block; }
          .shop-sidebar { position:fixed; bottom:-100%; left:0; width:100%; border-radius:12px 12px 0 0; z-index:2001; transition:.35s; top:auto; max-height:80vh; }
          .shop-sidebar.open { bottom:0; }
          .shop-grid { grid-template-columns:repeat(2,1fr); }
          .shop-hero { height:140px; }
        }
      `}</style>
    </div>
  );
};

export default Shop;
