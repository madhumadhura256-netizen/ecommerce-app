import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cart = [],
    updateQty, // ✅ FIXED NAME
    removeFromCart,
    clearCart,
    cartTotal = 0,
    cartCount = 0,
  } = useContext(CartContext) || {};

  const { user } = useContext(AuthContext) || {};

  /* ---------------- ADDRESS ---------------- */
  const [address, setAddress] = useState("");
  const [confirmedAddress, setConfirmedAddress] = useState("");

  /* ---------------- COUPON ---------------- */
  const [couponInput, setCouponInput] = useState("");

  // Auto coupons
  const getAutoDiscount = (total) => {
    if (total >= 300) return 70;
    if (total >= 200) return 50;
    return 0;
  };

  const autoDiscount = getAutoDiscount(cartTotal);
  const manualDiscount = Number(couponInput) || 0;

  const appliedDiscount =
    manualDiscount > 0 ? manualDiscount : autoDiscount;

  const shipping = cartTotal >= 99 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.05);

  const finalTotal =
    cartTotal + shipping + tax - appliedDiscount;

  const dp = (p) =>
    p.discount
      ? Math.round(p.price - (p.price * p.discount) / 100)
      : p.price;

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

  /* ---------------- EMPTY CART ---------------- */
  if (!cart.length) {
    return (
      <div style={styles.empty}>
        <h2>🛒 Your cart is empty</h2>
        <Link to="/" style={styles.shopBtn}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1>Shopping Cart</h1>
          <span>{cartCount} items</span>
          <button style={styles.clearBtn} onClick={clearCart}>
            Clear
          </button>
        </div>

        <div style={styles.layout}>

          {/* LEFT ITEMS */}
          <div>
            {cart.map((item) => (
              <div key={item._id} style={styles.card}>

                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  style={styles.img}
                />

                <div style={{ flex: 1 }}>
                  <h3 style={styles.text}>{item.name}</h3>
                  <p style={styles.muted}>{item.category}</p>

                  <div>
                    <b>₹{dp(item)}</b>{" "}
                    {item.discount > 0 && (
                      <del>₹{item.price}</del>
                    )}
                  </div>

                  <div style={styles.actions}>
                    <button
                      onClick={() =>
                        updateQty(item._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>

                    <span style={styles.text}>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQty(item._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item._id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT SUMMARY */}
          <div style={styles.summary}>

            <h3>Order Summary</h3>

            <p>Subtotal: ₹{cartTotal}</p>

            <p style={{ color: "green" }}>
              🚚 Free delivery above ₹99
            </p>

            <p>Shipping: {shipping === 0 ? "FREE" : `₹${shipping}`}</p>
            <p>Tax (5%): ₹{tax}</p>

            {/* COUPON */}
            <div style={styles.section}>
              <h4>🎁 Coupons</h4>

              <p style={{ fontSize: 12 }}>
                Auto: ₹200 → ₹50 OFF | ₹300 → ₹70 OFF
              </p>

              <p style={{ color: "green" }}>
                Discount Applied: -₹{appliedDiscount}
              </p>

              <input
                placeholder="Enter custom discount (optional)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* ADDRESS */}
            <div style={styles.section}>
              <h4>📍 Address</h4>

              <input
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={styles.input}
              />

              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                    "_blank"
                  )
                }
              >
                🔍 Open in Map
              </button>

              <button
                onClick={() => setConfirmedAddress(address)}
              >
                ✅ Confirm Address
              </button>

              {confirmedAddress && (
                <p style={{ color: "green" }}>
                  ✔ {confirmedAddress}
                </p>
              )}
            </div>

            {/* PAYMENT */}
            <div style={styles.section}>
              <h4>💳 Payment</h4>

              <label><input type="radio" name="pay" /> UPI</label>
              <label><input type="radio" name="pay" /> Card</label>
              <label><input type="radio" name="pay" /> COD</label>
            </div>

            <hr />

            <h2>Total: ₹{finalTotal}</h2>

            <button
              style={styles.payBtn}
              onClick={handleCheckout}
            >
              Proceed to Pay →
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES (DARK MODE SAFE) ---------------- */
const styles = {
  page: {
    padding: 20,
    background: "var(--bg)",
    color: "var(--text)",
    minHeight: "100vh",
  },

  container: { maxWidth: 1100, margin: "auto" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
  },

  card: {
    display: "flex",
    gap: 10,
    padding: 10,
    background: "var(--bg-card)",
    borderRadius: 10,
    marginBottom: 10,
  },

  img: {
    width: 70,
    height: 70,
    objectFit: "contain",
  },

  actions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  summary: {
    padding: 20,
    background: "var(--bg-card)",
    borderRadius: 10,
  },

  section: { marginTop: 10 },

  input: {
    width: "100%",
    padding: 8,
    marginTop: 5,
    background: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },

  payBtn: {
    width: "100%",
    padding: 12,
    background: "black",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  clearBtn: {
    background: "red",
    color: "white",
    border: "none",
    padding: 8,
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    padding: 50,
  },

  shopBtn: {
    background: "black",
    color: "white",
    padding: 10,
    display: "inline-block",
    marginTop: 10,
    textDecoration: "none",
  },

  text: { color: "var(--text)" },
  muted: { color: "var(--text-muted)" },
};