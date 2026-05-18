import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { productAPI } from "../services/api";

const CATS = { fruits:"🍎", vegetables:"🥦", beauty:"💄", clothes:"👗", electronics:"📱", shoes:"👟", snacks:"🍿", chocolates:"🍫", groceries:"🛒" };

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [imgIdx, setImgIdx]     = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished]     = useState(false);
  const [tab, setTab]           = useState("desc");
  const [added, setAdded]       = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getById(id);
        const p = res.data?.product || res.data;
        setProduct(p);
        const rel = await productAPI.getByCategory(p.category);
        setRelated((rel.data?.products || rel.data || []).filter(x => x._id !== id).slice(0, 4));
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product) {
      const w = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWished(w.includes(product._id));
    }
  }, [product]);

  const toggleWish = () => {
    const w = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updated = wished ? w.filter(x => x !== product._id) : [...w, product._id];
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWished(!wished);
  };

  const handleAddCart = () => {
    addToCart({ ...product, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discounted = p => p.discount ? Math.round(p.price - p.price * p.discount / 100) : p.price;

  if (loading) return (
    <div className="detail-skeleton-wrap">
      <div className="detail-skeleton-img" />
      <div className="detail-skeleton-info">
        {[1,2,3,4,5].map(i => <div key={i} className="skel-line" style={{width:`${100-i*12}%`}} />)}
      </div>
      <style>{`.detail-skeleton-wrap{display:flex;gap:40px;padding:60px 40px;max-width:1100px;margin:0 auto;}
      .detail-skeleton-img{width:420px;height:420px;border-radius:20px;background:var(--bg-hover,#f3f4f6);flex-shrink:0;animation:shimmer 1.4s infinite;}
      .detail-skeleton-info{flex:1;display:flex;flex-direction:column;gap:16px;padding-top:20px;}
      .skel-line{height:20px;border-radius:8px;background:var(--bg-hover,#f3f4f6);animation:shimmer 1.4s infinite;}
      @keyframes shimmer{0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6}}`}</style>
    </div>
  );
  if (!product) return <div className="not-found">Product not found. <Link to="/">Go home</Link></div>;

  const images = product.images?.length ? product.images : [null];
  const finalPrice = discounted(product);
  const savings = product.price - finalPrice;

  return (
    <div className="pd-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> /
        <Link to={`/category/${product.category}`}>{product.category}</Link> /
        <span>{product.name}</span>
      </nav>

      <div className="pd-layout">
        {/* Images */}
        <div className="pd-images">
          <div className="pd-main-img">
            {images[imgIdx]
              ? <img src={images[imgIdx]} alt={product.name} />
              : <div className="pd-img-placeholder">{CATS[product.category] || "📦"}</div>
            }
            {product.discount > 0 && <span className="pd-badge">{product.discount}% OFF</span>}
            <button className={`pd-wish-btn ${wished ? "active" : ""}`} onClick={toggleWish}>
              {wished ? "❤️" : "🤍"}
            </button>
          </div>
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button key={i} className={`pd-thumb ${i === imgIdx ? "active" : ""}`} onClick={() => setImgIdx(i)}>
                  {img ? <img src={img} alt="" /> : <span>{CATS[product.category]}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <p className="pd-category">{CATS[product.category]} {product.category}</p>
          <h1 className="pd-name">{product.name}</h1>
          {product.brand && <p className="pd-brand">Brand: <strong>{product.brand}</strong></p>}

          <div className="pd-rating-row">
            <div className="stars">{"★".repeat(Math.floor(product.ratings))}{"☆".repeat(5 - Math.floor(product.ratings))}</div>
            <span className="pd-rating-val">{product.ratings}</span>
            <span className="pd-reviews">({product.numReviews} reviews)</span>
          </div>

          <div className="pd-price-block">
            <span className="pd-price">₹{finalPrice.toLocaleString()}</span>
            {product.discount > 0 && <>
              <span className="pd-mrp">₹{product.price.toLocaleString()}</span>
              <span className="pd-save">Save ₹{savings.toLocaleString()}</span>
            </>}
          </div>

          <div className="pd-stock">
            {product.stock > 0
              ? <><span className="in-stock">✓ In Stock</span> — {product.stock} left</>
              : <span className="out-stock">✗ Out of Stock</span>
            }
          </div>

          {/* Quantity */}
          <div className="pd-qty-row">
            <span className="qty-label">Quantity</span>
            <div className="qty-ctrl">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</button>
            </div>
          </div>

          <div className="pd-actions">
            <button className={`btn-cart ${added ? "added" : ""}`} onClick={handleAddCart} disabled={product.stock === 0 || added}>
              {added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
            </button>
            <button className="btn-buy" onClick={() => { handleAddCart(); navigate("/cart"); }} disabled={product.stock === 0}>
              Buy Now
            </button>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="pd-tabs-section">
        <div className="pd-tabs">
          {["desc","reviews"].map(t => (
            <button key={t} className={`pd-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "desc" ? "Description" : `Reviews (${product.numReviews})`}
            </button>
          ))}
        </div>
        <div className="pd-tab-content">
          {tab === "desc" && (
            <p className="pd-desc">{product.description}</p>
          )}
          {tab === "reviews" && (
            <div className="reviews-list">
              {product.reviews?.length
                ? product.reviews.map(r => (
                  <div key={r._id} className="review-item">
                    <div className="review-header">
                      <div className="review-avatar">{r.name[0]}</div>
                      <div>
                        <p className="review-name">{r.name}</p>
                        <div className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
                      </div>
                      <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))
                : <p className="no-reviews">No reviews yet.</p>
              }
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="related-section">
          <h2 className="section-title">Related Products</h2>
          <div className="related-grid">
            {related.map(p => (
              <Link key={p._id} to={`/product/${p._id}`} className="related-card">
                <div className="related-img">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <span>{CATS[p.category]||"📦"}</span>}
                </div>
                <p className="related-name">{p.name}</p>
                <p className="related-price">₹{discounted(p).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .pd-page { max-width:1100px; margin:0 auto; padding:20px 24px 60px; }
        .breadcrumb { font-size:0.82rem; color:var(--text-muted,#888); margin-bottom:24px; }
        .breadcrumb a { color:var(--text-muted,#888); text-decoration:none; margin:0 6px; }
        .breadcrumb a:first-child { margin-left:0; }
        .breadcrumb span { margin-left:6px; color:var(--text,#111); font-weight:600; }
        .pd-layout { display:grid; grid-template-columns:1fr 1fr; gap:48px; margin-bottom:48px; }
        .pd-images { display:flex; flex-direction:column; gap:14px; }
        .pd-main-img {
          position:relative; aspect-ratio:1; border-radius:20px; overflow:hidden;
          background:var(--bg-hover,#f9fafb); border:1px solid var(--border,#e5e7eb);
        }
        .pd-main-img img { width:100%; height:100%; object-fit:cover; }
        .pd-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:8rem; }
        .pd-badge { position:absolute; top:14px; left:14px; background:#ef4444; color:#fff; font-size:0.8rem; font-weight:800; padding:4px 10px; border-radius:20px; }
        .pd-wish-btn { position:absolute; top:14px; right:14px; background:var(--bg-card,#fff); border:none; border-radius:50%; width:38px; height:38px; font-size:1.2rem; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.12); transition:transform 0.2s; }
        .pd-wish-btn:hover { transform:scale(1.15); }
        .pd-thumbs { display:flex; gap:10px; }
        .pd-thumb { width:70px; height:70px; border-radius:12px; overflow:hidden; border:2px solid var(--border,#e5e7eb); cursor:pointer; background:var(--bg-hover,#f3f4f6); display:flex; align-items:center; justify-content:center; transition:border-color 0.2s; }
        .pd-thumb.active { border-color:#FF6B35; }
        .pd-thumb img { width:100%; height:100%; object-fit:cover; }
        .pd-thumb span { font-size:1.8rem; }
        .pd-info { display:flex; flex-direction:column; gap:16px; padding-top:8px; }
        .pd-category { font-size:0.8rem; font-weight:700; color:#FF6B35; text-transform:uppercase; letter-spacing:0.06em; margin:0; }
        .pd-name { font-family:'Playfair Display',Georgia,serif; font-size:1.8rem; font-weight:800; color:var(--text,#111); margin:0; line-height:1.3; }
        .pd-brand { font-size:0.88rem; color:var(--text-muted,#888); margin:0; }
        .pd-rating-row { display:flex; align-items:center; gap:10px; }
        .stars { color:#f59e0b; font-size:1.1rem; }
        .pd-rating-val { font-weight:800; color:var(--text,#111); }
        .pd-reviews { color:var(--text-muted,#888); font-size:0.88rem; text-decoration:underline; cursor:pointer; }
        .pd-price-block { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .pd-price { font-size:2rem; font-weight:900; color:var(--text,#111); }
        .pd-mrp { font-size:1.1rem; color:var(--text-muted,#aaa); text-decoration:line-through; }
        .pd-save { background:#dcfce7; color:#16a34a; font-size:0.85rem; font-weight:700; padding:4px 10px; border-radius:20px; }
        .pd-stock { font-size:0.88rem; color:var(--text-muted,#888); }
        .in-stock { color:#16a34a; font-weight:700; }
        .out-stock { color:#ef4444; font-weight:700; }
        .pd-qty-row { display:flex; align-items:center; gap:16px; }
        .qty-label { font-weight:700; font-size:0.9rem; color:var(--text,#111); }
        .qty-ctrl { display:flex; align-items:center; gap:0; border:1.5px solid var(--border,#d1d5db); border-radius:12px; overflow:hidden; }
        .qty-ctrl button { width:38px; height:38px; border:none; background:var(--bg-hover,#f3f4f6); color:var(--text,#111); font-size:1.2rem; font-weight:700; cursor:pointer; transition:background 0.15s; }
        .qty-ctrl button:hover:not(:disabled) { background:var(--border,#e5e7eb); }
        .qty-ctrl button:disabled { opacity:0.4; cursor:not-allowed; }
        .qty-ctrl span { padding:0 18px; font-weight:800; font-size:1rem; color:var(--text,#111); }
        .pd-actions { display:flex; gap:12px; }
        .btn-cart {
          flex:1; padding:14px; border-radius:14px; border:none;
          background:linear-gradient(135deg,#FF6B35,#f43f5e);
          color:#fff; font-weight:800; font-size:1rem; cursor:pointer; transition:all 0.25s;
        }
        .btn-cart.added { background:linear-gradient(135deg,#22c55e,#16a34a); }
        .btn-cart:disabled { opacity:0.6; cursor:not-allowed; }
        .btn-buy {
          flex:1; padding:14px; border-radius:14px;
          border:2px solid var(--text,#111); background:transparent;
          color:var(--text,#111); font-weight:800; font-size:1rem; cursor:pointer; transition:all 0.2s;
        }
        .btn-buy:hover:not(:disabled) { background:var(--text,#111); color:var(--bg-card,#fff); }
        .btn-buy:disabled { opacity:0.4; cursor:not-allowed; }
        .pd-features { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        .pd-feat { display:flex; flex-direction:column; align-items:center; gap:4px; padding:12px 8px; border-radius:12px; background:var(--bg-hover,#f9fafb); border:1px solid var(--border,#e5e7eb); font-size:0.75rem; font-weight:600; color:var(--text-muted,#666); text-align:center; }
        .pd-feat span:first-child { font-size:1.4rem; }
        .pd-tabs-section { border-top:1px solid var(--border,#e5e7eb); padding-top:32px; margin-bottom:40px; }
        .pd-tabs { display:flex; gap:0; border-bottom:1px solid var(--border,#e5e7eb); margin-bottom:24px; }
        .pd-tab { padding:12px 24px; border:none; background:none; font-size:0.95rem; font-weight:600; color:var(--text-muted,#888); cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-1px; transition:all 0.2s; }
        .pd-tab.active { color:#FF6B35; border-bottom-color:#FF6B35; }
        .pd-desc { color:var(--text,#444); line-height:1.8; font-size:0.95rem; margin:0; }
        .reviews-list { display:flex; flex-direction:column; gap:20px; }
        .review-item { padding:20px; border-radius:16px; background:var(--bg-hover,#f9fafb); border:1px solid var(--border,#e5e7eb); }
        .review-header { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
        .review-avatar { width:40px; height:40px; border-radius:50%; background:#FF6B35; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1rem; flex-shrink:0; }
        .review-name { font-weight:700; font-size:0.9rem; color:var(--text,#111); margin:0 0 2px; }
        .review-stars { color:#f59e0b; font-size:0.85rem; }
        .review-date { margin-left:auto; font-size:0.78rem; color:var(--text-muted,#aaa); }
        .review-comment { font-size:0.9rem; color:var(--text,#444); margin:0; line-height:1.6; }
        .no-reviews { color:var(--text-muted,#888); text-align:center; padding:30px; }
        .related-section { border-top:1px solid var(--border,#e5e7eb); padding-top:32px; }
        .section-title { font-family:'Playfair Display',Georgia,serif; font-size:1.5rem; font-weight:800; margin:0 0 20px; color:var(--text,#111); }
        .related-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .related-card { text-decoration:none; border-radius:16px; overflow:hidden; border:1px solid var(--border,#e5e7eb); background:var(--bg-card,#fff); transition:transform 0.2s,box-shadow 0.2s; }
        .related-card:hover { transform:translateY(-4px); box-shadow:0 8px 24px rgba(0,0,0,0.1); }
        .related-img { aspect-ratio:1; background:var(--bg-hover,#f9fafb); display:flex; align-items:center; justify-content:center; font-size:3rem; overflow:hidden; }
        .related-img img { width:100%; height:100%; object-fit:cover; }
        .related-name { font-size:0.85rem; font-weight:700; color:var(--text,#111); padding:8px 12px 4px; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .related-price { font-size:0.9rem; font-weight:800; color:#FF6B35; padding:0 12px 12px; margin:0; }
        .not-found { text-align:center; padding:80px; font-size:1.1rem; color:var(--text-muted,#888); }
        .not-found a { color:#FF6B35; }
        @media(max-width:768px){
          .pd-layout { grid-template-columns:1fr; gap:24px; }
          .pd-features { grid-template-columns:repeat(2,1fr); }
          .related-grid { grid-template-columns:repeat(2,1fr); }
          .pd-actions { flex-direction:column; }
        }
      `}</style>
    </div>
  );
}