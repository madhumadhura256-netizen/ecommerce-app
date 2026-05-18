import { useState, useEffect, useContext } from "react";
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
  { title: "Fresh Picks Daily", sub: "Farm-to-door fruits & vegetables", bg: "linear-gradient(135deg,#134e4a,#065f46)", emoji: "🌿" },
  { title: "Tech Deals",        sub: "Up to 40% off electronics",         bg: "linear-gradient(135deg,#1e3a5f,#1e40af)", emoji: "⚡" },
  { title: "Style Season",      sub: "New arrivals in clothes & shoes",   bg: "linear-gradient(135deg,#4a1942,#7c3aed)", emoji: "✨" },
];

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [products, setProducts]     = useState([]);
  const [featured, setFeatured]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [bannerIdx, setBannerIdx]   = useState(0);
  const [search, setSearch]         = useState("");
  const [wishlist, setWishlist]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productAPI.getAll({ limit: 20 });
        const all = res.data?.products || res.data || [];
        setProducts(all);
        setFeatured(all.slice(0, 8));
      } catch {
  setProducts([]);          // ✅ just set empty
  setFeatured([]);
}finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

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

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="home-page">
      {/* ── HERO BANNER ─────────────────────────── */}
      <section className="hero-banner" style={{ background: BANNERS[bannerIdx].bg }}>
        <div className="hero-content">
          <span className="hero-emoji">{BANNERS[bannerIdx].emoji}</span>
          <h1 className="hero-title">{BANNERS[bannerIdx].title}</h1>
          <p className="hero-sub">{BANNERS[bannerIdx].sub}</p>
          <div className="hero-actions">
            <Link to="/category/all" className="btn-primary">Shop Now</Link>
            {!user && <Link to="/register" className="btn-ghost">Join Free</Link>}
          </div>
        </div>
        <div className="banner-dots">
          {BANNERS.map((_, i) => (
            <button key={i} className={`dot ${i === bannerIdx ? "active" : ""}`} onClick={() => setBannerIdx(i)} />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────── */}
      <section className="section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/category/${cat.id}`} className="category-card" style={{ "--cat-color": cat.color }}>
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ───────────────────── */}
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
                <Link to={`/product/${p._id}`} className="product-img-wrap">
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
      /* add this at the top of your <style> block */
:root {
  --text: #111;
  --text-muted: #888;
  --bg-card: #ffffff;
  --bg-hover: #f3f4f6;
  --border: #e5e7eb;
  --accent: #FF6B35;
}

html.dark {
  --text: #f5f5f5;
  --text-muted: #aaaaaa;
  --bg-card: #1a1a1a;
  --bg-hover: #2a2a2a;
  --border: #333333;
  --accent: #FF6B35;
}
        .home-page { min-height: 100vh; }

        /* Hero */
        .hero-banner {
          position: relative;
          min-height: 340px;
          display: flex;
          align-items: center;
          padding: 60px 40px 80px;
          overflow: hidden;
          transition: background 0.8s ease;
        }
        .hero-banner::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 60%);
        }
        .hero-content { position: relative; z-index: 1; max-width: 520px; }
        .hero-emoji { font-size: 3rem; display: block; margin-bottom: 12px; }
        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin: 0 0 12px;
        }
        .hero-sub { color: rgba(255,255,255,0.82); font-size: 1.1rem; margin: 0 0 28px; }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-primary {
          padding: 12px 28px; border-radius: 50px; font-weight: 700;
          background: #fff; color: #111; text-decoration: none;
          font-size: 0.95rem; transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
        .btn-ghost {
          padding: 12px 28px; border-radius: 50px; font-weight: 600;
          border: 2px solid rgba(255,255,255,0.6); color: #fff;
          text-decoration: none; font-size: 0.95rem; transition: all 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.15); }
        .banner-dots { position: absolute; bottom: 24px; left: 40px; display: flex; gap: 8px; }
        .dot {
          width: 8px; height: 8px; border-radius: 50%; border: none;
          background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s; padding: 0;
        }
        .dot.active { width: 24px; border-radius: 4px; background: #fff; }

        /* Search */
        .search-section {
          max-width: 700px; margin: -28px auto 0; padding: 0 20px;
          position: relative; z-index: 10;
        }
        .search-form {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-card, #fff); border-radius: 50px;
          padding: 6px 6px 6px 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          border: 1px solid var(--border, #e5e7eb);
        }
        .search-icon { font-size: 1.1rem; opacity: 0.5; }
        .search-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 1rem; color: var(--text, #111);
        }
        .search-clear { background: none; border: none; cursor: pointer; font-size: 1rem; opacity: 0.5; padding: 4px; }
        .search-btn {
          padding: 10px 24px; border-radius: 50px; border: none;
          background: var(--accent, #FF6B35); color: #fff;
          font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: opacity 0.2s;
        }
        .search-btn:hover { opacity: 0.88; }
        .search-dropdown {
          position: absolute; left: 20px; right: 20px; top: calc(100% + 8px);
          background: var(--bg-card, #fff); border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          border: 1px solid var(--border, #e5e7eb); overflow: hidden; z-index: 100;
        }
        .search-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 20px; text-decoration: none; color: var(--text, #111);
          transition: background 0.15s; border-bottom: 1px solid var(--border, #f3f4f6);
        }
        .search-item:hover { background: var(--bg-hover, #f9fafb); }
        .search-item-price { font-weight: 700; color: var(--accent, #FF6B35); }

        /* Sections */
        .section { padding: 40px 24px; max-width: 1200px; margin: 0 auto; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.6rem; font-weight: 800; margin: 0 0 24px;
          color: var(--text, #111);
        }
        .section-header .section-title { margin-bottom: 0; }
        .see-all { color: var(--accent, #FF6B35); text-decoration: none; font-weight: 600; font-size: 0.95rem; }

        /* Categories */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
          gap: 14px;
        }
        .category-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 18px 8px; border-radius: 18px;
          text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
          background: color-mix(in srgb, var(--cat-color) 12%, var(--bg-card, #fff));
          border: 1.5px solid color-mix(in srgb, var(--cat-color) 30%, transparent);
        }
        .category-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .cat-emoji { font-size: 2rem; }
        .cat-label { font-size: 0.78rem; font-weight: 700; color: var(--text, #111); text-align: center; }

        /* Products grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 20px;
        }
        .product-skeleton {
          height: 320px; border-radius: 18px;
          background: linear-gradient(90deg, var(--bg-hover,#f3f4f6) 25%, var(--bg-card,#fff) 50%, var(--bg-hover,#f3f4f6) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .product-card {
          position: relative; border-radius: 18px; overflow: hidden;
          background: var(--bg-card, #fff);
          border: 1px solid var(--border, #e5e7eb);
          transition: transform 0.25s, box-shadow 0.25s;
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .product-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
        .product-img-wrap { display: block; position: relative; aspect-ratio: 1; overflow: hidden; background: var(--bg-hover,#f9fafb); }
        .product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .product-card:hover .product-img { transform: scale(1.06); }
        .product-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4rem; }
        .badge-discount {
          position: absolute; top: 10px; left: 10px;
          background: #ef4444; color: #fff; font-size: 0.72rem;
          font-weight: 800; padding: 3px 8px; border-radius: 20px;
        }
        .wishlist-btn {
          position: absolute; top: 10px; right: 10px; z-index: 2;
          background: var(--bg-card,#fff); border: none; border-radius: 50%;
          width: 34px; height: 34px; font-size: 1rem; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: transform 0.2s;
        }
        .wishlist-btn:hover { transform: scale(1.15); }
        .product-info { padding: 14px; }
        .product-category { font-size: 0.72rem; font-weight: 700; color: var(--accent,#FF6B35); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px; }
        .product-name { font-size: 0.95rem; font-weight: 700; color: var(--text,#111); margin: 0 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .product-rating { font-size: 0.78rem; color: #f59e0b; margin-bottom: 6px; }
        .rating-count { color: var(--text-muted,#888); margin-left: 4px; }
        .product-price-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .product-price { font-size: 1.05rem; font-weight: 800; color: var(--text,#111); }
        .product-mrp { font-size: 0.82rem; color: var(--text-muted,#888); text-decoration: line-through; }
        .btn-add-cart {
          width: 100%; padding: 9px; border-radius: 10px; border: none;
          background: var(--accent,#FF6B35); color: #fff; font-weight: 700;
          font-size: 0.88rem; cursor: pointer; transition: opacity 0.2s, transform 0.15s;
        }
        .btn-add-cart:hover:not(:disabled) { opacity: 0.88; transform: scale(0.98); }
        .btn-add-cart:disabled { background: var(--bg-hover,#e5e7eb); color: var(--text-muted,#888); cursor: not-allowed; }

        /* Promo */
        .promo-strip {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 0;
          background: var(--bg-card,#fff);
          border-top: 1px solid var(--border,#e5e7eb);
          border-bottom: 1px solid var(--border,#e5e7eb);
          margin: 20px 0;
        }
        .promo-item {
          display: flex; align-items: center; gap: 14px;
          padding: 22px 32px; flex: 1; min-width: 200px;
          border-right: 1px solid var(--border,#e5e7eb);
        }
        .promo-item:last-child { border-right: none; }
        .promo-icon { font-size: 2rem; }
        .promo-title { font-weight: 800; font-size: 0.95rem; color: var(--text,#111); margin: 0 0 2px; }
        .promo-sub { font-size: 0.8rem; color: var(--text-muted,#888); margin: 0; }

        @media (max-width: 600px) {
          .hero-banner { padding: 40px 20px 60px; }
          .section { padding: 30px 16px; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .promo-strip { flex-direction: column; }
          .promo-item { border-right: none; border-bottom: 1px solid var(--border,#e5e7eb); padding: 16px 20px; }
        }
      `}</style>
    </div>
  );
}