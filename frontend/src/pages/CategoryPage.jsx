import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { productAPI } from "../services/api";

const CATS = {
  all:"All Products", fruits:"🍎 Fruits", vegetables:"🥦 Vegetables", beauty:"💄 Beauty",
  clothes:"👗 Clothes", electronics:"📱 Electronics", shoes:"👟 Shoes",
  snacks:"🍿 Snacks", chocolates:"🍫 Chocolates", groceries:"🛒 Groceries"
};
const SORTS = [
  { value:"newest",    label:"Newest First" },
  { value:"price_asc", label:"Price: Low to High" },
  { value:"price_desc",label:"Price: High to Low" },
  { value:"rating",    label:"Top Rated" },
];

export default function CategoryPage() {
  const { category } = useParams();
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("wishlist") || "[]"));

  useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);

    try {
      let res;

      if (!category || category === "all") {
        res = await productAPI.getAll();
      } else {
        res = await productAPI.getAll(); // 👈 IMPORTANT CHANGE (fetch all first)
      }

      const allProducts = res.data?.products || res.data || [];

      // 🔥 FIX CATEGORY MATCHING (case + space safe)
      const filteredProducts =
        category === "all"
          ? allProducts
          : allProducts.filter(
              (p) =>
                p.category &&
                p.category.toLowerCase().trim() ===
                  category.toLowerCase().trim()
            );

      setProducts(filteredProducts);

      const max = Math.max(
        ...filteredProducts.map((p) => p.price || 0),
        1000
      );

      setMaxPrice(max);
      setPriceRange([0, max]);
    } catch (err) {
      console.log("Category fetch error:", err);

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [category]);

  const toggleWishlist = id => {
    const updated = wishlist.includes(id) ? wishlist.filter(x=>x!==id) : [...wishlist, id];
    setWishlist(updated); localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const dp = p => p.discount ? Math.round(p.price - p.price*p.discount/100) : p.price;

  const filtered = products
    .filter(p => dp(p) >= priceRange[0] && dp(p) <= priceRange[1])
    .filter(p => p.ratings >= minRating)
    .filter(p => inStockOnly ? p.stock > 0 : true)
    .sort((a,b) => {
      if (sort==="price_asc") return dp(a)-dp(b);
      if (sort==="price_desc") return dp(b)-dp(a);
      if (sort==="rating") return b.ratings-a.ratings;
      return 0;
    });

  return (
    <div className="cat-page">
      {/* Header */}
      <div className="cat-header">
        <div className="cat-header-inner">
          <nav className="breadcrumb"><Link to="/">Home</Link> / <span>{CATS[category]||category}</span></nav>
          <h1 className="cat-title">{CATS[category] || category}</h1>
          <p className="cat-count">{filtered.length} products found</p>
        </div>
      </div>

      <div className="cat-body">
        {/* Mobile filter toggle */}
        <button className="filter-toggle-btn" onClick={()=>setSidebarOpen(true)}>
          ⚙️ Filters & Sort
        </button>

        {/* Sidebar */}
        <aside className={`cat-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="close-sidebar" onClick={()=>setSidebarOpen(false)}>✕</button>
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Sort By</h4>
            <div className="sort-options">
              {SORTS.map(s => (
                <label key={s.value} className="radio-label">
                  <input type="radio" name="sort" value={s.value} checked={sort===s.value} onChange={()=>setSort(s.value)} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Price Range</h4>
            <div className="price-range">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            <input type="range" min={0} max={maxPrice} value={priceRange[1]}
              onChange={e=>setPriceRange([priceRange[0],+e.target.value])}
              className="range-slider" />
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Minimum Rating</h4>
            <div className="rating-filters">
              {[0,3,4,4.5].map(r=>(
                <label key={r} className="radio-label">
                  <input type="radio" name="rating" checked={minRating===r} onChange={()=>setMinRating(r)} />
                  {r===0?"Any":r+"★ & above"}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="checkbox-label">
              <input type="checkbox" checked={inStockOnly} onChange={e=>setInStockOnly(e.target.checked)} />
              In Stock Only
            </label>
          </div>

          <button className="btn-reset" onClick={()=>{setSort("newest");setPriceRange([0,maxPrice]);setMinRating(0);setInStockOnly(false);}}>
            Reset Filters
          </button>
        </aside>

        {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)} />}

        {/* Products Grid */}
        <main className="cat-products">
          {loading ? (
            <div className="products-grid">
              {Array(8).fill(0).map((_,i)=><div key={i} className="product-skeleton"/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
              <button className="btn-reset" onClick={()=>{setPriceRange([0,maxPrice]);setMinRating(0);setInStockOnly(false);}}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((p,idx)=>(
                <div key={p._id} className="product-card" style={{animationDelay:`${idx*40}ms`}}>
                  <Link to={`/product/${p._id}`} className="product-img-wrap">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} className="product-img" loading="lazy"/>
                      : <div className="product-img-placeholder">📦</div>}
                    {p.discount>0&&<span className="badge-discount">{p.discount}% OFF</span>}
                  </Link>
                  <button className={`wishlist-btn ${wishlist.includes(p._id)?"active":""}`} onClick={()=>toggleWishlist(p._id)}>
                    {wishlist.includes(p._id)?"❤️":"🤍"}
                  </button>
                  <div className="product-info">
                    <p className="product-category">{p.category}</p>
                    <h3 className="product-name">{p.name}</h3>
                    <div className="product-rating">
                      {"★".repeat(Math.floor(p.ratings))}{"☆".repeat(5-Math.floor(p.ratings))}
                      <span className="rating-count">({p.numReviews})</span>
                    </div>
                    <div className="product-price-row">
                      <span className="product-price">₹{dp(p).toLocaleString()}</span>
                      {p.discount>0&&<span className="product-mrp">₹{p.price.toLocaleString()}</span>}
                    </div>
                    <button className="btn-add-cart" onClick={()=>addToCart({...p,quantity:1})} disabled={p.stock===0}>
                      {p.stock===0?"Out of Stock":"Add to Cart 🛒"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .cat-page { min-height:100vh; }
        .cat-header { background:linear-gradient(135deg,var(--bg-card,#fff),var(--bg-hover,#f9fafb)); border-bottom:1px solid var(--border,#e5e7eb); padding:28px 24px 24px; }
        .cat-header-inner { max-width:1200px; margin:0 auto; }
        .breadcrumb { font-size:0.82rem; color:var(--text-muted,#888); margin-bottom:8px; }
        .breadcrumb a { color:var(--text-muted,#888); text-decoration:none; margin-right:6px; }
        .breadcrumb span { margin-left:6px; color:var(--text,#111); font-weight:600; }
        .cat-title { font-family:'Playfair Display',Georgia,serif; font-size:1.9rem; font-weight:800; color:var(--text,#111); margin:0 0 4px; }
        .cat-count { font-size:0.88rem; color:var(--text-muted,#888); margin:0; }
        .cat-body { max-width:1200px; margin:0 auto; display:flex; gap:28px; padding:24px; align-items:flex-start; }
        .filter-toggle-btn { display:none; margin-bottom:16px; padding:10px 20px; border-radius:10px; border:1.5px solid var(--border,#d1d5db); background:var(--bg-card,#fff); color:var(--text,#111); font-weight:700; cursor:pointer; }
        .cat-sidebar {
          width:240px; flex-shrink:0; background:var(--bg-card,#fff);
          border-radius:18px; padding:20px; border:1px solid var(--border,#e5e7eb);
          position:sticky; top:80px;
        }
        .sidebar-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .sidebar-header h3 { margin:0; font-size:1rem; font-weight:800; color:var(--text,#111); }
        .close-sidebar { display:none; background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--text-muted,#888); }
        .filter-section { border-bottom:1px solid var(--border,#e5e7eb); padding-bottom:16px; margin-bottom:16px; }
        .filter-section:last-of-type { border-bottom:none; }
        .filter-title { font-size:0.82rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted,#888); margin:0 0 10px; }
        .sort-options,.rating-filters { display:flex; flex-direction:column; gap:8px; }
        .radio-label { display:flex; align-items:center; gap:8px; font-size:0.88rem; color:var(--text,#444); cursor:pointer; }
        .price-range { display:flex; justify-content:space-between; font-size:0.82rem; font-weight:700; color:var(--text,#111); margin-bottom:8px; }
        .range-slider { width:100%; accent-color:#FF6B35; }
        .checkbox-label { display:flex; align-items:center; gap:8px; font-size:0.88rem; color:var(--text,#444); cursor:pointer; }
        .btn-reset { width:100%; padding:10px; border-radius:10px; border:1.5px solid var(--border,#d1d5db); background:transparent; color:var(--text,#111); font-weight:700; font-size:0.88rem; cursor:pointer; margin-top:8px; transition:background 0.2s; }
        .btn-reset:hover { background:var(--bg-hover,#f3f4f6); }
        .cat-products { flex:1; min-width:0; }
        .products-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:18px; }
        .product-skeleton { height:300px; border-radius:18px; background:var(--bg-hover,#f3f4f6); animation:shimmer 1.4s infinite; }
        @keyframes shimmer{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
        .product-card { position:relative; border-radius:18px; overflow:hidden; background:var(--bg-card,#fff); border:1px solid var(--border,#e5e7eb); transition:transform 0.25s,box-shadow 0.25s; animation:fadeUp 0.4s ease both; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .product-card:hover { transform:translateY(-5px); box-shadow:0 14px 36px rgba(0,0,0,0.1); }
        .product-img-wrap { display:block; aspect-ratio:1; overflow:hidden; background:var(--bg-hover,#f9fafb); position:relative; }
        .product-img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; }
        .product-card:hover .product-img { transform:scale(1.06); }
        .product-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:4rem; }
        .badge-discount { position:absolute; top:8px; left:8px; background:#ef4444; color:#fff; font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:20px; }
        .wishlist-btn { position:absolute; top:8px; right:8px; z-index:2; background:var(--bg-card,#fff); border:none; border-radius:50%; width:32px; height:32px; font-size:0.9rem; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.12); transition:transform 0.2s; }
        .wishlist-btn:hover { transform:scale(1.15); }
        .product-info { padding:12px; }
        .product-category { font-size:0.7rem; font-weight:700; color:#FF6B35; text-transform:uppercase; letter-spacing:.05em; margin:0 0 3px; }
        .product-name { font-size:0.9rem; font-weight:700; color:var(--text,#111); margin:0 0 5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .product-rating { font-size:0.75rem; color:#f59e0b; margin-bottom:6px; }
        .rating-count { color:var(--text-muted,#888); margin-left:3px; }
        .product-price-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
        .product-price { font-size:1rem; font-weight:800; color:var(--text,#111); }
        .product-mrp { font-size:0.8rem; color:var(--text-muted,#aaa); text-decoration:line-through; }
        .btn-add-cart { width:100%; padding:9px; border-radius:10px; border:none; background:var(--accent,#FF6B35); color:#fff; font-weight:700; font-size:0.85rem; cursor:pointer; transition:opacity 0.2s; }
        .btn-add-cart:hover:not(:disabled) { opacity:0.88; }
        .btn-add-cart:disabled { background:var(--bg-hover,#e5e7eb); color:var(--text-muted,#888); cursor:not-allowed; }
        .empty-state { text-align:center; padding:80px 20px; }
        .empty-icon { font-size:4rem; display:block; margin-bottom:16px; }
        .empty-state h3 { font-size:1.3rem; color:var(--text,#111); margin:0 0 8px; }
        .empty-state p { color:var(--text-muted,#888); margin:0 0 20px; }
        .sidebar-overlay { display:none; }
        @media(max-width:768px){
          .cat-body{flex-direction:column;padding:16px;}
          .filter-toggle-btn{display:block;width:100%;}
          .cat-sidebar{display:none;position:fixed;top:0;left:0;width:80%;max-width:300px;height:100vh;z-index:200;border-radius:0;overflow-y:auto;transform:translateX(-100%);transition:transform 0.3s;}
          .cat-sidebar.open{display:block;transform:translateX(0);}
          .close-sidebar{display:block;}
          .sidebar-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:199;}
          .products-grid{grid-template-columns:repeat(2,1fr);gap:12px;}
        }
      `}</style>
    </div>
  );
}