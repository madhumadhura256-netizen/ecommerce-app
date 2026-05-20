import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { productAPI } from "../services/api";

const CATEGORIES = [
  { id: "fruits",      label: "Fruits",       emoji: "🍎", color: "#FF6B6B" },
  { id: "vegetables",  label: "Vegetables",   emoji: "🥦", color: "#51CF66" },
  { id: "beauty",      label: "Beauty",       emoji: "💄", color: "#F783AC" },
  { id: "clothes",     label: "Clothes",      emoji: "👗", color: "#845EF7" },
  { id: "electronics", label: "Electronics",  emoji: "📱", color: "#339AF0" },
  { id: "shoes",       label: "Shoes",        emoji: "👟", color: "#FF922B" },
  { id: "snacks",      label: "Snacks",       emoji: "🍿", color: "#FAB005" },
  { id: "chocolates",  label: "Chocolates",   emoji: "🍫", color: "#8B5CF6" },
  { id: "groceries",   label: "Groceries",    emoji: "🛒", color: "#20C997" },
];

const BANNERS = [
  {
    title: "Fresh Picks Daily",
    sub: "Farm-to-door fruits & vegetables",
    cta: "Shop Fresh →",
    bg: "linear-gradient(135deg,#0d3b2e 0%,#134e4a 40%,#065f46 100%)",
    accent: "#34d399",
    emoji: "🌿",
    tag: "NEW ARRIVALS",
    shape: "◆",
  },
  {
    title: "Tech Deals",
    sub: "Up to 40% off electronics & gadgets",
    cta: "Explore Deals →",
    bg: "linear-gradient(135deg,#0c1a3a 0%,#1e3a5f 40%,#1e40af 100%)",
    accent: "#60a5fa",
    emoji: "⚡",
    tag: "LIMITED TIME",
    shape: "●",
  },
  {
    title: "Style Season",
    sub: "New arrivals in clothes & shoes",
    cta: "View Collection →",
    bg: "linear-gradient(135deg,#2d0a3e 0%,#4a1942 40%,#7c3aed 100%)",
    accent: "#c084fc",
    emoji: "✨",
    tag: "TRENDING",
    shape: "▲",
  },
];

const INTERVAL = 4500;

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [products, setProducts]   = useState([]);
  const [featured, setFeatured]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [prevIdx, setPrevIdx]     = useState(null);
  const [animDir, setAnimDir]     = useState("next"); // "next" | "prev"
  const [progress, setProgress]   = useState(0);
  const [paused, setPaused]       = useState(false);
  const [search, setSearch]       = useState("");
  const [wishlist, setWishlist]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); }
    catch { return []; }
  });
  const progressRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productAPI.getAll({ limit: 20 });
        const all = res.data?.products || res.data || [];
        setProducts(all);
        setFeatured(all.slice(0, 8));
      } catch {
        setProducts([]);
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    startTimeRef.current = Date.now();

    const frame = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) progressRef.current = requestAnimationFrame(frame);
    };
    progressRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(progressRef.current);
  }, [bannerIdx, paused]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => goTo((bannerIdx + 1) % BANNERS.length, "next"), INTERVAL);
    return () => clearTimeout(t);
  }, [bannerIdx, paused]);

  const goTo = (idx, dir = "next") => {
    if (idx === bannerIdx) return;
    setAnimDir(dir);
    setPrevIdx(bannerIdx);
    setBannerIdx(idx);
    setTimeout(() => setPrevIdx(null), 600);
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const discountedPrice = (price, discount) =>
    discount ? Math.round(price - (price * discount) / 100) : price;

  const cur = BANNERS[bannerIdx];

  return (
    <div className="home-page">

      {/* ── HERO CAROUSEL ── */}
      <section
        className="hero-banner"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Sliding panels */}
        {BANNERS.map((b, i) => {
          const isActive  = i === bannerIdx;
          const isPrev    = i === prevIdx;
          let cls = "slide";
          if (isActive) cls += " slide-enter " + (animDir === "next" ? "from-right" : "from-left");
          else if (isPrev) cls += " slide-exit "  + (animDir === "next" ? "to-left"   : "to-right");
          else cls += " slide-hidden";

          return (
            <div key={i} className={cls} style={{ background: b.bg }}>
              {/* Decorative floating shapes */}
              <div className="deco-shapes">
                <div className="shape s1" style={{ color: b.accent }}>{b.shape}</div>
                <div className="shape s2" style={{ color: b.accent }}>{b.shape}</div>
                <div className="shape s3" style={{ color: b.accent }}>{b.shape}</div>
              </div>
              {/* Radial glow */}
              <div className="radial-glow" style={{ background: `radial-gradient(ellipse at 75% 50%, ${b.accent}22 0%, transparent 65%)` }} />

              <div className="hero-content">
                <div className="hero-tag" style={{ color: b.accent, borderColor: `${b.accent}55`, background: `${b.accent}15` }}>
                  {b.tag}
                </div>
                <div className="hero-emoji-wrap">
                  <span className="hero-emoji">{b.emoji}</span>
                </div>
                <h1 className="hero-title">{b.title}</h1>
                <p className="hero-sub">{b.sub}</p>
                <div className="hero-actions">
                  <Link to="/category/all" className="btn-hero-primary" style={{ background: b.accent, color: "#000" }}>
                    {b.cta}
                  </Link>
                  {!user && (
                    <Link to="/register" className="btn-hero-ghost">
                      Join Free
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Nav arrows */}
        <button
          className="arrow arrow-left"
          onClick={() => goTo((bannerIdx - 1 + BANNERS.length) % BANNERS.length, "prev")}
        >‹</button>
        <button
          className="arrow arrow-right"
          onClick={() => goTo((bannerIdx + 1) % BANNERS.length, "next")}
        >›</button>

        {/* Bottom controls */}
        <div className="carousel-controls">
          <div className="banner-dots">
            {BANNERS.map((b, i) => (
              <button
                key={i}
                className={`dot ${i === bannerIdx ? "active" : ""}`}
                style={i === bannerIdx ? { background: cur.accent } : {}}
                onClick={() => goTo(i, i > bannerIdx ? "next" : "prev")}
              />
            ))}
          </div>
          <div className="slide-counter">
            <span className="cur-num">{String(bannerIdx + 1).padStart(2, "0")}</span>
            <span className="sep">/</span>
            <span className="total-num">{String(BANNERS.length).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-track">
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              background: cur.accent,
              transition: paused ? "none" : "width 0.1s linear",
            }}
          />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="category-card"
              style={{ "--cat-color": cat.color, animationDelay: `${i * 40}ms` }}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/category/all" className="see-all">See All →</Link>
        </div>
        {loading ? (
          <div className="products-grid">
            {Array(8).fill(0).map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : (
          <div className="products-grid">
            {featured.map((p, idx) => (
              <div key={p._id} className="product-card" style={{ animationDelay: `${idx * 60}ms` }}>
                <Link to={`/products/${p._id}`} className="product-img-wrap">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} className="product-img" loading="lazy" />
                    : <div className="product-img-placeholder">
                        {CATEGORIES.find(c => c.id === p.category)?.emoji || "📦"}
                      </div>
                  }
                  {p.discount > 0 && <span className="badge-discount">{p.discount}% OFF</span>}
                </Link>
                <button
                  className={`wishlist-btn ${wishlist.includes(p._id) ? "active" : ""}`}
                  onClick={() => toggleWishlist(p._id)}
                  title="Add to wishlist"
                >
                  {wishlist.includes(p._id) ? "❤️" : "🤍"}
                </button>
                <div className="product-info">
                  <p className="product-category">{p.category}</p>
                  <h3 className="product-name">{p.name}</h3>
                  <div className="product-rating">
                    {"★".repeat(Math.floor(p.ratings || 0))}{"☆".repeat(5 - Math.floor(p.ratings || 0))}
                    <span className="rating-count">({p.numReviews})</span>
                  </div>
                  <div className="product-price-row">
                    <span className="product-price">₹{discountedPrice(p.price, p.discount)}</span>
                    {p.discount > 0 && <span className="product-mrp">₹{p.price}</span>}
                  </div>
                  <button
                    className="btn-add-cart"
                    onClick={() => addToCart({ ...p, quantity: 1 })}
                    disabled={p.stock === 0}
                  >
                    {p.stock === 0 ? "Out of Stock" : "Add to Cart 🛒"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        :root {
          --text: #111111;
          --text-muted: #888888;
          --bg-card: #ffffff;
          --bg-page: #f8fafc;
          --bg-hover: #f3f4f6;
          --border: #e5e7eb;
          --accent: #FF6B35;
        }
        html.dark {
          --text: #f0efe9;
          --text-muted: #6b6860;
          --bg-card: #1a1a17;
          --bg-page: #0f0f0d;
          --bg-hover: #1e1e1b;
          --border: rgba(255,255,255,0.08);
          --accent: #FF6B35;
        }

        .home-page { min-height: 100vh; background: var(--bg-page); }

        /* ── CAROUSEL ── */
        .hero-banner {
          position: relative;
          height: 360px;
          overflow: hidden;
          user-select: none;
        }
        @media (max-width: 600px) { .hero-banner { height: 280px; } }

        /* Slides */
        .slide {
          position: absolute; inset: 0;
          display: flex; align-items: center;
          padding: 48px 48px 80px;
        }
        @media (max-width: 600px) { .slide { padding: 28px 20px 72px; } }

        .slide-hidden { opacity: 0; pointer-events: none; transform: translateX(100%); }

        /* Enter animations */
        .slide-enter.from-right {
          animation: slideFromRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .slide-enter.from-left {
          animation: slideFromLeft 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        /* Exit animations */
        .slide-exit.to-left {
          animation: slideToLeft 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .slide-exit.to-right {
          animation: slideToRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes slideFromRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
        @keyframes slideFromLeft {
          from { transform: translateX(-100%); opacity: 0.6; }
          to   { transform: translateX(0);     opacity: 1;   }
        }
        @keyframes slideToLeft {
          from { transform: translateX(0);    opacity: 1;   }
          to   { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes slideToRight {
          from { transform: translateX(0);    opacity: 1;  }
          to   { transform: translateX(100%); opacity: 0; }
        }

        /* Decorative shapes */
        .deco-shapes {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
        }
        .shape {
          position: absolute; font-size: 6rem; opacity: 0.07;
          animation: floatShape 6s ease-in-out infinite;
        }
        .s1 { top: -20px; right: 10%;  animation-duration: 7s; font-size: 8rem; }
        .s2 { bottom: 10px; right: 22%; animation-duration: 5s; animation-delay: -2s; font-size: 4rem; }
        .s3 { top: 30%; right: 5%;    animation-duration: 9s; animation-delay: -4s; font-size: 6rem; opacity: 0.04; }
        @keyframes floatShape {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(12deg); }
        }

        .radial-glow { position: absolute; inset: 0; pointer-events: none; }

        /* Hero content */
        .hero-content { position: relative; z-index: 2; max-width: 520px; }

        .hero-tag {
          display: inline-block;
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.12em;
          padding: 4px 12px; border-radius: 20px;
          border: 1px solid; margin-bottom: 12px;
          animation: tagPop 0.5s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes tagPop {
          from { opacity: 0; transform: scale(0.7) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .hero-emoji-wrap {
          animation: emojiDrop 0.55s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .hero-emoji { font-size: 2.6rem; display: block; margin-bottom: 8px; }
        @keyframes emojiDrop {
          from { opacity: 0; transform: translateY(-20px) scale(0.6); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.7rem, 4.5vw, 2.8rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin: 0 0 10px;
          animation: titleSlide 0.55s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes titleSlide {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .hero-sub {
          color: rgba(255,255,255,0.78); font-size: 0.97rem; margin: 0 0 22px;
          animation: titleSlide 0.55s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .hero-actions {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: titleSlide 0.55s 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .btn-hero-primary {
          padding: 11px 24px; border-radius: 50px; font-weight: 800;
          text-decoration: none; font-size: 0.9rem;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(0,0,0,0.3);
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.35); }
        .btn-hero-ghost {
          padding: 11px 24px; border-radius: 50px; font-weight: 600;
          border: 2px solid rgba(255,255,255,0.55); color: #fff;
          text-decoration: none; font-size: 0.9rem; transition: all 0.2s;
        }
        .btn-hero-ghost:hover { background: rgba(255,255,255,0.15); }

        /* Arrows */
        .arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 10; width: 40px; height: 40px; border-radius: 50%;
          border: none; background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          color: #fff; font-size: 1.6rem; line-height: 1;
          cursor: pointer; transition: background 0.2s, transform 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .arrow:hover { background: rgba(255,255,255,0.28); transform: translateY(-50%) scale(1.08); }
        .arrow-left  { left: 16px; }
        .arrow-right { right: 16px; }
        @media (max-width: 600px) { .arrow { display: none; } }

        /* Bottom controls */
        .carousel-controls {
          position: absolute; bottom: 18px; left: 48px; right: 48px;
          z-index: 10; display: flex; justify-content: space-between; align-items: center;
        }
        @media (max-width: 600px) { .carousel-controls { left: 20px; right: 20px; } }

        .banner-dots { display: flex; gap: 8px; align-items: center; }
        .dot {
          width: 7px; height: 7px; border-radius: 50%; border: none;
          background: rgba(255,255,255,0.35); cursor: pointer;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); padding: 0;
        }
        .dot.active { width: 24px; border-radius: 4px; }

        .slide-counter {
          display: flex; align-items: baseline; gap: 3px;
          font-family: 'DM Sans', sans-serif;
        }
        .cur-num  { font-size: 1.1rem; font-weight: 800; color: #fff; }
        .sep      { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin: 0 1px; }
        .total-num { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

        /* Progress bar */
        .progress-track {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; background: rgba(255,255,255,0.12); z-index: 10;
        }
        .progress-bar { height: 100%; border-radius: 0 2px 2px 0; }

        /* ── Sections ── */
        .section { padding: 36px 24px; max-width: 1200px; margin: 0 auto; }
        .section-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px;
        }
        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.5rem; font-weight: 800;
          margin: 0 0 20px; color: var(--text);
        }
        .section-header .section-title { margin-bottom: 0; }
        .see-all { color: var(--accent); text-decoration: none; font-weight: 600; font-size: 0.92rem; }

        /* ── Categories ── */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 10px;
        }
        .category-card {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          padding: 12px 6px; border-radius: 14px; text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          background: color-mix(in srgb, var(--cat-color) 12%, var(--bg-card));
          border: 1.5px solid color-mix(in srgb, var(--cat-color) 30%, transparent);
          animation: fadeUp 0.4s ease both;
        }
        .category-card:hover { transform: translateY(-4px) scale(1.04); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .cat-emoji { font-size: 1.6rem; line-height: 1; }
        .cat-label {
          font-size: 0.68rem; font-weight: 700;
          color: var(--text); text-align: center; line-height: 1.2; word-break: break-word;
        }

        /* ── Products ── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px;
        }
        .product-skeleton {
          height: 310px; border-radius: 18px;
          background: linear-gradient(90deg, var(--bg-hover) 25%, var(--bg-card) 50%, var(--bg-hover) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .product-card {
          position: relative; border-radius: 18px; overflow: hidden;
          background: var(--bg-card); border: 1px solid var(--border);
          transition: transform 0.25s, box-shadow 0.25s;
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 14px 36px rgba(0,0,0,0.12); }

        .product-img-wrap {
          display: block; position: relative;
          aspect-ratio: 1; overflow: hidden; background: var(--bg-hover);
        }
        .product-img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; }
        .product-card:hover .product-img { transform: scale(1.06); }
        .product-img-placeholder {
          width:100%; height:100%;
          display:flex; align-items:center; justify-content:center; font-size:3.5rem;
        }
        .badge-discount {
          position:absolute; top:8px; left:8px;
          background:#ef4444; color:#fff; font-size:0.7rem;
          font-weight:800; padding:3px 7px; border-radius:20px;
        }
        .wishlist-btn {
          position:absolute; top:8px; right:8px; z-index:2;
          background:var(--bg-card); border:none; border-radius:50%;
          width:32px; height:32px; font-size:0.95rem; cursor:pointer;
          box-shadow:0 2px 8px rgba(0,0,0,0.12); transition:transform 0.2s;
        }
        .wishlist-btn:hover { transform:scale(1.15); }

        .product-info { padding: 12px; }
        .product-category {
          font-size:0.7rem; font-weight:700; color:var(--accent);
          text-transform:uppercase; letter-spacing:0.05em; margin:0 0 3px;
        }
        .product-name {
          font-size:0.92rem; font-weight:700; color:var(--text);
          margin:0 0 5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .product-rating { font-size:0.75rem; color:#f59e0b; margin-bottom:5px; }
        .rating-count { color:var(--text-muted); margin-left:3px; }
        .product-price-row { display:flex; align-items:center; gap:7px; margin-bottom:9px; }
        .product-price { font-size:1rem; font-weight:800; color:var(--text); }
        .product-mrp { font-size:0.8rem; color:var(--text-muted); text-decoration:line-through; }

        .btn-add-cart {
          width:100%; padding:8px; border-radius:10px; border:none;
          background:var(--accent); color:#fff; font-weight:700;
          font-size:0.85rem; cursor:pointer; transition:opacity 0.2s, transform 0.15s;
        }
        .btn-add-cart:hover:not(:disabled) { opacity:0.88; transform:scale(0.98); }
        .btn-add-cart:disabled {
          background:var(--bg-hover); color:var(--text-muted); cursor:not-allowed;
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .section { padding: 24px 14px; }
          .categories-grid { grid-template-columns: repeat(5, 1fr); gap: 8px; }
          .category-card { padding: 10px 4px; border-radius: 12px; }
          .cat-emoji { font-size: 1.4rem; }
          .cat-label { font-size: 0.62rem; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        @media (max-width: 380px) {
          .categories-grid { grid-template-columns: repeat(4, 1fr); gap: 6px; }
          .cat-emoji { font-size: 1.25rem; }
          .cat-label { font-size: 0.58rem; }
        }
      `}</style>
    </div>
  );
}