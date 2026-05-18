import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { productAPI } from "../services/api";

export default function Wishlist() {
  const { addToCart } = useContext(CartContext);

  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productAPI.getAll();
        const all = res.data?.products || res.data || [];

        const filtered = all.filter((p) =>
          wishlistIds.includes(p._id)
        );

        setProducts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [wishlistIds]);

  const removeWishlist = (id) => {
    const updated = wishlistIds.filter((x) => x !== id);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updated)
    );

    setWishlistIds(updated);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>❤️ My Wishlist</h1>
        <p>Products you saved for later</p>
      </div>

      {loading ? (
        <div className="wishlist-loading">
          Loading wishlist...
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🛍️</span>
          <h2>Your wishlist is empty</h2>
          <Link to="/" className="shop-btn">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map((p) => (
            <div key={p._id} className="wishlist-card">
              <Link to={`/product/${p._id}`}>
                <div className="wishlist-img">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
              </Link>

              <div className="wishlist-info">
                <h3>{p.name}</h3>

                <p className="wishlist-price">
                  ₹{p.price}
                </p>

                <div className="wishlist-actions">
                  <button
                    onClick={() =>
                      addToCart({
                        ...p,
                        quantity: 1,
                      })
                    }
                    className="cart-btn"
                  >
                    Add to Cart 🛒
                  </button>

                  <button
                    onClick={() =>
                      removeWishlist(p._id)
                    }
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .wishlist-page {
          padding: 40px 24px;
          min-height: 100vh;
        }

        .wishlist-header h1 {
          font-size: 2.2rem;
          margin-bottom: 8px;
        }

        .wishlist-header p {
          color: #777;
          margin-bottom: 32px;
        }

        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(240px,1fr));
          gap: 24px;
        }

        .wishlist-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          transition: transform 0.25s;
        }

        .wishlist-card:hover {
          transform: translateY(-5px);
        }

        .wishlist-img {
          aspect-ratio: 1;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wishlist-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .wishlist-info {
          padding: 16px;
        }

        .wishlist-price {
          font-weight: 800;
          margin: 12px 0;
          color: #FF6B35;
        }

        .wishlist-actions {
          display: flex;
          gap: 10px;
        }

        .cart-btn,
        .remove-btn,
        .shop-btn {
          border: none;
          padding: 10px 14px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          text-decoration: none;
        }

        .cart-btn,
        .shop-btn {
          background: #FF6B35;
          color: white;
        }

        .remove-btn {
          background: #f3f4f6;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 4rem;
        }
      `}</style>
    </div>
  );
}