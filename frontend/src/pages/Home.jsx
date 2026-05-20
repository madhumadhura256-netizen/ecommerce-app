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
  const [products, setProducts]   = useState([]);
  const [featured, setFeatured]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [search, setSearch]       = useState("");
  const [wishlist, setWishlist]   = useState(() => {
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
        setProducts([]);
        setFeatured([]);
      } finally {
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

      {/* ── HERO BANNER ── */}
      <section className="hero-banner" style={{ background: BANNERS[bannerIdx].bg }}>
        <div className="hero-content">
          <span className="hero-emoji">{BANNERS[bannerIdx].emoji}</span>
          <h1 className="hero-title">{BANNERS[bannerIdx].title}</h1>
          <p className="hero-sub">{BANNERS[bannerIdx].sub}</p>
          <div className="hero-actions">
            <Link to="/category/all" className="btn-hero-primary">Shop Now</Link>
            {!user && <Link to="/register" className="btn-hero-ghost">Join Free</Link>}
          </div>
        </div>
        <div className="banner-dots">
          {BANNERS.map((_, i) => (
            <button key={i} className={`dot ${i === bannerIdx ? "active" : ""}`} onClick={() => setBannerIdx(i)} />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
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
        /* ── CSS Variables — light & dark ── */
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

        .home-page {
          min-height: 100vh;
          background: var(--bg-page);
        }

        /* ── Hero ── */
        .hero-banner {
          position: relative;
          min-height: 300px;
          display: flex;
          align-items: center;
          padding: 56px 40px 72px;
          overflow: hidden;
          transition: background 0.8s ease;
        }
        .hero-banner::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 60%);
        }
        .hero-content { position: relative; z-index: 1; max-width: 520px; }
        .hero-emoji { font-size: 2.8rem; display: block; margin-bottom: 10px; }
        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin: 0 0 10px;
        }
        .hero-sub { color: rgba(255,255,255,0.82); font-size: 1rem; margin: 0 0 24px; }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-hero-primary {
          padding: 11px 26px; border-radius: 50px; font-weight: 700;
          background: #fff; color: #111; text-decoration: none;
          font-size: 0.92rem; transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
        .btn-hero-ghost {
          padding: 11px 26px; border-radius: 50px; font-weight: 600;
          border: 2px solid rgba(255,255,255,0.6); color: #fff;
          text-decoration: none; font-size: 0.92rem; transition: all 0.2s;
        }
        .btn-hero-ghost:hover { background: rgba(255,255,255,0.15); }
        .banner-dots { position: absolute; bottom: 20px; left: 40px; display: flex; gap: 8px; z-index: 2; }
        .dot {
          width: 7px; height: 7px; border-radius: 50%; border: none;
          background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s; padding: 0;
        }
        .dot.active { width: 22px; border-radius: 4px; background: #fff; }

        /* ── Sections ── */
        .section { padding: 36px 24px; max-width: 1200px; margin: 0 auto; }
        .section-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px;
        }
        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.5rem; font-weight: 800;
          margin: 0 0 20px;
          color: var(--text);
        }
        .section-header .section-title { margin-bottom: 0; }
        .see-all { color: var(--accent); text-decoration: none; font-weight: 600; font-size: 0.92rem; }

        /* ── CATEGORIES — medium size ── */
        .categories-grid {
          display: grid;
          /* Smaller min size = smaller boxes; more fit per row */
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 10px;
        }
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          /* Reduced padding vs original */
          padding: 12px 6px;
          border-radius: 14px;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          background: color-mix(in srgb, var(--cat-color) 12%, var(--bg-card));
          border: 1.5px solid color-mix(in srgb, var(--cat-color) 30%, transparent);
        }
        .category-card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.1); }
        /* Smaller emoji */
        .cat-emoji { font-size: 1.6rem; line-height: 1; }
        /* Smaller label */
        .cat-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text);
          text-align: center;
          line-height: 1.2;
          word-break: break-word;
        }

        /* ── Products grid ── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px;
        }
        .product-skeleton {
          height: 310px; border-radius: 18px;
          background: linear-gradient(
            90deg,
            var(--bg-hover) 25%,
            var(--bg-card)  50%,
            var(--bg-hover) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .product-card {
          position: relative; border-radius: 18px; overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border);
          transition: transform 0.25s, box-shadow 0.25s;
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 14px 36px rgba(0,0,0,0.12); }

        .product-img-wrap {
          display: block; position: relative;
          aspect-ratio: 1; overflow: hidden;
          background: var(--bg-hover);
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
          .hero-banner { padding: 36px 16px 56px; }
          .section { padding: 24px 14px; }

          /* On small phones: 5 columns for categories */
          .categories-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
          }
          .category-card { padding: 10px 4px; border-radius: 12px; }
          .cat-emoji { font-size: 1.4rem; }
          .cat-label { font-size: 0.62rem; }

          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }

        @media (max-width: 380px) {
          /* Very small phones: 4 columns */
          .categories-grid { grid-template-columns: repeat(4, 1fr); gap: 6px; }
          .cat-emoji { font-size: 1.25rem; }
          .cat-label { font-size: 0.58rem; }
        }
      `}</style>
    </div>
  );
}