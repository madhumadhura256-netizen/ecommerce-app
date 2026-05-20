import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cart = [],
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal = 0,
    cartCount = 0,
  } = useContext(CartContext) || {};

  const { user } = useContext(AuthContext) || {};

  const [address, setAddress] = useState("");
  const [confirmedAddress, setConfirmedAddress] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const getAutoDiscount = (total) => {
    if (total >= 300) return 70;
    if (total >= 200) return 50;
    return 0;
  };

  const autoDiscount = getAutoDiscount(cartTotal);
  const manualDiscount = couponApplied ? (Number(couponInput) || 0) : 0;
  const appliedDiscount = manualDiscount > 0 ? manualDiscount : autoDiscount;
  const shipping = cartTotal >= 99 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.05);
  const finalTotal = cartTotal + shipping + tax - appliedDiscount;

  const dp = (p) =>
    p.discount ? Math.round(p.price - (p.price * p.discount) / 100) : p.price;

  const handleRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 300);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (!confirmedAddress) {
      alert("Please confirm your delivery address");
      return;
    }
    navigate("/checkout");
  };

  if (!cart.length) {
    return (
      <div className="empty-cart">
        <div className="empty-inner">
          <div className="empty-icon">🛒</div>
          <h2 className="empty-title">Your cart is empty</h2>
          <p className="empty-sub">Looks like you haven't added anything yet</p>
          <Link to="/" className="btn-shop">Start Shopping</Link>
        </div>
        <style>{emptyStyles}</style>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">

        {/* Header */}
        <div className="cart-header">
          <div>
            <h1 className="cart-title">My Cart</h1>
            <p className="cart-sub">{cartCount} {cartCount === 1 ? "item" : "items"} in your bag</p>
          </div>
          <button className="btn-clear" onClick={clearCart}>
            <span>🗑</span> Clear all
          </button>
        </div>

        <div className="cart-layout">

          {/* LEFT — Items */}
          <div className="items-col">
            {cart.map((item, idx) => (
              <div
                key={item._id}
                className={`cart-item ${removingId === item._id ? "removing" : ""}`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Image */}
                <div className="item-img-wrap">
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.name} className="item-img" />
                    : <div className="item-img-placeholder">📦</div>
                  }
                  {item.discount > 0 && (
                    <span className="item-badge">{item.discount}%</span>
                  )}
                </div>

                {/* Info */}
                <div className="item-info">
                  <p className="item-category">{item.category}</p>
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-price-row">
                    <span className="item-price">₹{dp(item)}</span>
                    {item.discount > 0 && (
                      <span className="item-mrp">₹{item.price}</span>
                    )}
                    {item.discount > 0 && (
                      <span className="item-saving">Save ₹{item.price - dp(item)}</span>
                    )}
                  </div>
                </div>

                {/* Quantity + Remove */}
                <div className="item-right">
                  <div className="qty-ctrl">
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >−</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item._id, item.quantity + 1)}
                    >+</button>
                  </div>
                  <p className="item-subtotal">₹{dp(item) * item.quantity}</p>
                  <button className="btn-remove" onClick={() => handleRemove(item._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Delivery info strip */}
            <div className="delivery-strip">
              {shipping === 0
                ? <span>🎉 <strong>Free delivery</strong> on your order!</span>
                : <span>🚚 Add <strong>₹{99 - cartTotal}</strong> more for free delivery</span>
              }
            </div>
          </div>

          {/* RIGHT — Summary */}
          <div className="summary-col">

            {/* Coupon */}
            <div className="summary-card">
              <h3 className="summary-section-title">🎁 Offers & Coupons</h3>
              <div className="auto-offers">
                <div className={`offer-chip ${cartTotal >= 200 ? "active" : ""}`}>
                  ₹200 → <strong>₹50 OFF</strong>
                </div>
                <div className={`offer-chip ${cartTotal >= 300 ? "active" : ""}`}>
                  ₹300 → <strong>₹70 OFF</strong>
                </div>
              </div>
              <div className="coupon-row">
                <input
                  className="coupon-input"
                  placeholder="Enter custom code"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); setCouponApplied(false); }}
                />
                <button
                  className="btn-apply"
                  onClick={() => setCouponApplied(true)}
                  disabled={!couponInput}
                >Apply</button>
              </div>
              {couponApplied && manualDiscount > 0 && (
                <p className="coupon-success">✅ ₹{manualDiscount} discount applied!</p>
              )}
            </div>

            {/* Address */}
            <div className="summary-card">
              <h3 className="summary-section-title">📍 Delivery Address</h3>
              <textarea
                className="address-input"
                placeholder="Enter your full delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
              <div className="address-btns">
                <button
                  className="btn-map"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank")}
                  disabled={!address}
                >
                  🗺 View on Map
                </button>
                <button
                  className="btn-confirm-addr"
                  onClick={() => setConfirmedAddress(address)}
                  disabled={!address}
                >
                  ✅ Confirm
                </button>
              </div>
              {confirmedAddress && (
                <div className="confirmed-addr">
                  <span>📌</span>
                  <span>{confirmedAddress}</span>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="summary-card">
              <h3 className="summary-section-title">💳 Payment Method</h3>
              <div className="payment-options">
                {[
                  { id: "upi",  label: "UPI",  icon: "⚡" },
                  { id: "card", label: "Card", icon: "💳" },
                  { id: "cod",  label: "COD",  icon: "💵" },
                ].map(opt => (
                  <label key={opt.id} className="payment-opt">
                    <input type="radio" name="pay" value={opt.id} />
                    <span className="pay-icon">{opt.icon}</span>
                    <span className="pay-label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="summary-card price-card">
              <h3 className="summary-section-title">Price Details</h3>
              <div className="price-rows">
                <div className="price-row">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="price-row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "free" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="price-row">
                  <span>Tax (5%)</span>
                  <span>₹{tax}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="price-row discount-row">
                    <span>Discount</span>
                    <span>−₹{appliedDiscount}</span>
                  </div>
                )}
              </div>
              <div className="price-total">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
              {appliedDiscount > 0 && (
                <p className="savings-msg">🎉 You're saving ₹{appliedDiscount} on this order!</p>
              )}

              <button className="btn-checkout" onClick={handleCheckout}>
                Proceed to Pay → ₹{finalTotal}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{cartStyles}</style>
    </div>
  );
}

const emptyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=DM+Sans:wght@400;600;700&display=swap');
  .empty-cart {
    min-height: 70vh; display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
  }
  .empty-inner { text-align: center; }
  .empty-icon { font-size: 5rem; margin-bottom: 16px; }
  .empty-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--text, #111); margin: 0 0 8px; }
  .empty-sub { color: var(--text-muted, #888); margin: 0 0 28px; }
  .btn-shop {
    display: inline-block; padding: 13px 32px; border-radius: 50px;
    background: linear-gradient(135deg, #FF6B35, #f43f5e);
    color: #fff; font-weight: 700; text-decoration: none; font-size: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(255,107,53,0.35);
  }
  .btn-shop:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,107,53,0.45); }
`;

const cartStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap');

  .cart-page {
    min-height: 100vh;
    background: var(--bg-page, #f8fafc);
    font-family: 'DM Sans', sans-serif;
    padding: 24px 16px 80px;
  }
  html.dark .cart-page { background: var(--bg-page, #0f0f0d); }

  .cart-container { max-width: 1100px; margin: 0 auto; }

  /* Header */
  .cart-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 28px;
  }
  .cart-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 800;
    color: var(--text, #111); margin: 0 0 4px;
  }
  html.dark .cart-title { color: #f0efe9; }
  .cart-sub { color: var(--text-muted, #888); margin: 0; font-size: 0.9rem; }
  .btn-clear {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px; border: 1.5px solid #fecaca;
    background: #fef2f2; color: #dc2626; font-weight: 600; font-size: 0.85rem;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-clear:hover { background: #fee2e2; }

  /* Layout */
  .cart-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
    align-items: start;
  }

  /* Cart items */
  .items-col { display: flex; flex-direction: column; gap: 12px; }

  .cart-item {
    display: flex; align-items: center; gap: 16px;
    background: var(--bg-card, #fff);
    border-radius: 18px;
    padding: 16px;
    border: 1px solid var(--border, #e5e7eb);
    transition: transform 0.25s, box-shadow 0.25s, opacity 0.3s;
    animation: slideIn 0.35s ease both;
  }
  html.dark .cart-item { background: #1a1a17; border-color: rgba(255,255,255,0.08); }
  .cart-item:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .cart-item.removing { opacity: 0; transform: translateX(40px); }
  @keyframes slideIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }

  .item-img-wrap {
    position: relative; width: 88px; height: 88px; flex-shrink: 0;
    border-radius: 14px; overflow: hidden;
    background: var(--bg-hover, #f3f4f6);
    border: 1px solid var(--border, #e5e7eb);
  }
  html.dark .item-img-wrap { background: #242420; border-color: rgba(255,255,255,0.06); }
  .item-img { width: 100%; height: 100%; object-fit: cover; }
  .item-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:2.2rem; }
  .item-badge {
    position: absolute; bottom: 5px; left: 5px;
    background: #ef4444; color: #fff; font-size: 0.65rem;
    font-weight: 800; padding: 2px 6px; border-radius: 6px;
  }

  .item-info { flex: 1; min-width: 0; }
  .item-category {
    font-size: 0.7rem; font-weight: 700; color: #FF6B35;
    text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 3px;
  }
  .item-name {
    font-size: 0.95rem; font-weight: 700;
    color: var(--text, #111); margin: 0 0 8px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  html.dark .item-name { color: #f0efe9; }
  .item-price-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .item-price { font-size: 1rem; font-weight: 800; color: var(--text, #111); }
  html.dark .item-price { color: #f0efe9; }
  .item-mrp { font-size: 0.8rem; color: var(--text-muted, #aaa); text-decoration: line-through; }
  .item-saving {
    font-size: 0.72rem; font-weight: 700; color: #16a34a;
    background: #dcfce7; padding: 2px 7px; border-radius: 20px;
  }

  .item-right {
    display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;
  }
  .qty-ctrl {
    display: flex; align-items: center;
    border: 1.5px solid var(--border, #d1d5db); border-radius: 10px; overflow: hidden;
  }
  html.dark .qty-ctrl { border-color: rgba(255,255,255,0.12); }
  .qty-btn {
    width: 34px; height: 34px; border: none;
    background: var(--bg-hover, #f3f4f6); color: var(--text, #111);
    font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: background 0.15s;
  }
  html.dark .qty-btn { background: #242420; color: #f0efe9; }
  .qty-btn:hover:not(:disabled) { background: var(--border, #e5e7eb); }
  .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .qty-val {
    padding: 0 14px; font-weight: 800; font-size: 0.95rem;
    color: var(--text, #111); min-width: 32px; text-align: center;
  }
  html.dark .qty-val { color: #f0efe9; }

  .item-subtotal { font-size: 0.88rem; font-weight: 800; color: #FF6B35; margin: 0; }
  .btn-remove {
    border: none; background: none; color: var(--text-muted, #aaa);
    font-size: 0.78rem; cursor: pointer; padding: 0;
    transition: color 0.2s; text-decoration: underline;
  }
  .btn-remove:hover { color: #ef4444; }

  /* Delivery strip */
  .delivery-strip {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border: 1px solid #a7f3d0; border-radius: 12px;
    padding: 12px 16px; font-size: 0.88rem; color: #065f46; font-weight: 500;
  }

  /* Summary */
  .summary-col { display: flex; flex-direction: column; gap: 16px; }

  .summary-card {
    background: var(--bg-card, #fff);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 18px; padding: 20px;
  }
  html.dark .summary-card { background: #1a1a17; border-color: rgba(255,255,255,0.08); }

  .summary-section-title {
    font-size: 0.92rem; font-weight: 700;
    color: var(--text, #111); margin: 0 0 14px;
  }
  html.dark .summary-section-title { color: #f0efe9; }

  /* Offers */
  .auto-offers { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .offer-chip {
    padding: 5px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600;
    border: 1.5px solid #d1d5db; color: var(--text-muted, #888);
    background: var(--bg-hover, #f9fafb); transition: all 0.3s;
  }
  .offer-chip.active {
    border-color: #16a34a; color: #16a34a;
    background: #dcfce7;
  }
  .coupon-row { display: flex; gap: 8px; }
  .coupon-input {
    flex: 1; padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid var(--border, #d1d5db);
    background: var(--bg-hover, #f9fafb); color: var(--text, #111);
    font-size: 0.88rem; outline: none; font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
  }
  html.dark .coupon-input { background: #242420; border-color: rgba(255,255,255,0.1); color: #f0efe9; }
  .coupon-input:focus { border-color: #FF6B35; }
  .btn-apply {
    padding: 10px 16px; border-radius: 10px; border: none;
    background: #FF6B35; color: #fff; font-weight: 700; font-size: 0.85rem;
    cursor: pointer; transition: opacity 0.2s; white-space: nowrap;
  }
  .btn-apply:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-apply:not(:disabled):hover { opacity: 0.88; }
  .coupon-success { font-size: 0.82rem; color: #16a34a; font-weight: 600; margin: 8px 0 0; }

  /* Address */
  .address-input {
    width: 100%; padding: 10px 14px; border-radius: 12px;
    border: 1.5px solid var(--border, #d1d5db);
    background: var(--bg-hover, #f9fafb); color: var(--text, #111);
    font-size: 0.88rem; resize: none; outline: none;
    font-family: 'DM Sans', sans-serif; box-sizing: border-box;
    transition: border-color 0.2s;
  }
  html.dark .address-input { background: #242420; border-color: rgba(255,255,255,0.1); color: #f0efe9; }
  .address-input:focus { border-color: #FF6B35; }
  .address-btns { display: flex; gap: 8px; margin-top: 10px; }
  .btn-map, .btn-confirm-addr {
    flex: 1; padding: 9px 12px; border-radius: 10px;
    font-weight: 600; font-size: 0.82rem; cursor: pointer; transition: all 0.2s;
  }
  .btn-map {
    border: 1.5px solid var(--border, #d1d5db);
    background: transparent; color: var(--text, #111);
  }
  html.dark .btn-map { border-color: rgba(255,255,255,0.1); color: #f0efe9; }
  .btn-map:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-map:not(:disabled):hover { background: var(--bg-hover, #f3f4f6); }
  .btn-confirm-addr {
    border: none; background: #16a34a; color: #fff;
  }
  .btn-confirm-addr:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-confirm-addr:not(:disabled):hover { background: #15803d; }
  .confirmed-addr {
    display: flex; gap: 8px; align-items: flex-start;
    margin-top: 10px; padding: 10px 12px; border-radius: 10px;
    background: #dcfce7; color: #065f46; font-size: 0.82rem; font-weight: 500;
  }

  /* Payment */
  .payment-options { display: flex; gap: 10px; }
  .payment-opt {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 12px 8px; border-radius: 12px;
    border: 1.5px solid var(--border, #d1d5db);
    background: var(--bg-hover, #f9fafb); cursor: pointer;
    transition: all 0.2s;
  }
  html.dark .payment-opt { background: #242420; border-color: rgba(255,255,255,0.08); }
  .payment-opt:has(input:checked) { border-color: #FF6B35; background: #fff5f0; }
  html.dark .payment-opt:has(input:checked) { background: rgba(255,107,53,0.1); }
  .payment-opt input { display: none; }
  .pay-icon { font-size: 1.4rem; }
  .pay-label { font-size: 0.78rem; font-weight: 700; color: var(--text, #111); }
  html.dark .pay-label { color: #f0efe9; }

  /* Price breakdown */
  .price-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .price-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.88rem; color: var(--text-muted, #666);
  }
  html.dark .price-row { color: #6b6860; }
  .price-row .free { color: #16a34a; font-weight: 700; }
  .discount-row { color: #16a34a !important; font-weight: 600; }
  .price-total {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 1.15rem; font-weight: 800; color: var(--text, #111);
    border-top: 2px solid var(--border, #e5e7eb); padding-top: 14px; margin-bottom: 4px;
  }
  html.dark .price-total { color: #f0efe9; border-color: rgba(255,255,255,0.1); }
  .savings-msg {
    font-size: 0.8rem; color: #16a34a; font-weight: 600;
    text-align: center; margin: 8px 0 16px;
    background: #dcfce7; padding: 7px 12px; border-radius: 8px;
  }

  .btn-checkout {
    width: 100%; padding: 16px;
    background: linear-gradient(135deg, #FF6B35, #f43f5e);
    color: #fff; border: none; border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem; font-weight: 800; cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 6px 24px rgba(255,107,53,0.35);
    letter-spacing: 0.01em;
  }
  .btn-checkout:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(255,107,53,0.45); }
  .btn-checkout:active { transform: translateY(0); }

  /* Mobile */
  @media (max-width: 768px) {
    .cart-layout { grid-template-columns: 1fr; }
    .cart-item { gap: 12px; }
    .item-img-wrap { width: 72px; height: 72px; }
    .item-name { font-size: 0.88rem; }
    .payment-options { gap: 8px; }
  }
`;
